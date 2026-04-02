import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import Question from "../models/Questions.js";
import QuizSession from "../models/quizSession.model.js";

//start quiz attempt
export const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not published",
      });
    }

    // Delete unfinished sessions
    await QuizSession.deleteMany({
      user: req.user.id,
      quizId,
      isCompleted: false,
    });

    let finalQuestions = [];

    for (let moduleId of quiz.modules) {
      const questions = await Question.find({ moduleId });
      finalQuestions = finalQuestions.concat(questions);
    }

    if (!finalQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found for this quiz.",
      });
    }

    // Shuffle
    finalQuestions.sort(() => Math.random() - 0.5);

    const session = await QuizSession.create({
      user: req.user.id,
      quizId,
      questions: finalQuestions.map((q) => q._id),
      totalQuestions: finalQuestions.length,
      startedAt: new Date(),
      isCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: "Attempt started",
      data: {
        sessionId: session._id,
        quizTitle: quiz.title,
        timeLimit: quiz.timeLimit || "15 minutes",
        totalQuestions: finalQuestions.length,
        questions: finalQuestions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            _id: opt._id,
          })),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

//start combined attempt for multiple module quizzes
export const startCombinedAttempt = async (req, res, next) => {
  try {
    const { moduleQuizIds } = req.body;

    if (!moduleQuizIds || !moduleQuizIds.length) {
      return res.status(400).json({
        success: false,
        message: "No module quizzes provided",
      });
    }

    const quizzes = await Quiz.find({
      _id: { $in: moduleQuizIds.map(id => new mongoose.Types.ObjectId(id)) },
      status: "published",
    });

    if (!quizzes.length) {
      return res.status(404).json({
        success: false,
        message: "No quizzes found",
      });
    }

    // Remove unfinished sessions
    await QuizSession.deleteMany({
      user: req.user.id,
      quizId: { $in: moduleQuizIds },
      isCompleted: false,
    });

    let finalQuestions = [];
    const questionIdSet = new Set();

    for (let quiz of quizzes) {
      for (let moduleId of quiz.modules) {
        const questions = await Question.aggregate([
          { $match: { moduleId: new mongoose.Types.ObjectId(moduleId) } },
          { $sample: { size: 3 } }
        ]);

        const uniqueQuestions = questions.filter(
          (q) => !questionIdSet.has(q._id.toString())
        );

        uniqueQuestions.forEach((q) =>
          questionIdSet.add(q._id.toString())
        );

        finalQuestions = finalQuestions.concat(uniqueQuestions);
      }
    }

    if (!finalQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "No questions found",
      });
    }

    finalQuestions.sort(() => Math.random() - 0.5);

    const session = await QuizSession.create({
      user: req.user.id,
      quizId: null,
      isCombined: true,
      questions: finalQuestions.map((q) => q._id),
      totalQuestions: finalQuestions.length,
      startedAt: new Date(),
      isCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: "Combined attempt started",
      data: {
        sessionId: session._id,
        quizTitle: "Combined Module Quiz",
        timeLimit: "15 minutes",
        totalQuestions: finalQuestions.length,
        questions: finalQuestions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            _id: opt._id,
          })),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

//submit quiz attempt
export const submitAttempt = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    const session = await QuizSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Already submitted",
      });
    }

    // Expiry check
    if (session.isExpired()) {
      return res.status(400).json({
        success: false,
        message: "Time expired",
      });
    }

    // Fetch questions
    const questions = await Question.find({
      _id: { $in: session.questions },
    });

    let score = 0;
    let correct = 0;
    let wrong = 0;

    const evaluatedAnswers = [];

    for (let ans of answers) {
      const question = questions.find(
        (q) => q._id.toString() === ans.questionId
      );

      if (!question) continue;

      const correctAnswer = question.correct;

      //  GET CORRECT OPTION TEXT
      const correctOptionObj = question.options.find(
        (opt) => opt.id === correctAnswer
      );

      const isCorrect = ans.selectedOption === correctAnswer;

      if (isCorrect) {
        score++;
        correct++;
      } else {
        wrong++;
      }

      //  UPDATED RESPONSE OBJECT
      evaluatedAnswers.push({
        questionId: question._id,
        question: question.question,
        options: question.options,
        selectedOption: ans.selectedOption,
        correctAnswer,
        correctAnswerText: correctOptionObj?.text,
        isCorrect,
      });
    }

    // Time taken
    const completedAt = new Date();
    const timeTaken = Math.floor(
      (completedAt - new Date(session.startedAt)) / 1000
    );

    // Save everything
    session.answers = evaluatedAnswers;
    session.score = score;
    session.correctAnswers = correct;
    session.wrongAnswers = wrong;
    session.timeTaken = timeTaken;
    session.isCompleted = true;
    session.completedAt = completedAt;

    await session.save();

    // FINAL RESPONSE
    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        totalQuestions: session.totalQuestions,
        correctAnswers: correct,
        wrongAnswers: wrong,
        timeTaken: `${timeTaken} seconds`,
        result: evaluatedAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

//get quiz performance
export const getAttemptHistory = async (req, res, next) => {
  try {
    const attempts = await QuizSession.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};

//get attempt by id
export const getAttemptById = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizSession.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (err) {
    next(err);
  }
};