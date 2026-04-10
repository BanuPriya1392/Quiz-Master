import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import Question from "../models/Questions.js";
import QuizSession from "../models/quizSession.model.js";

// START QUIZ ATTEMPT
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

    // Get questions
    let finalQuestions = await Question.find({ quizId });

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
        timeLimit: quiz.timeLimit || "10 minutes",
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

// START COMBINED ATTEMPT
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
      _id: { $in: moduleQuizIds.map((id) => new mongoose.Types.ObjectId(id)) },
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

    // FIX: module loop remove → quizId use
    for (let quiz of quizzes) {
      const questions = await Question.aggregate([
        { $match: { quizId: quiz._id } },
        { $sample: { size: 3 } },
      ]);

      const uniqueQuestions = questions.filter(
        (q) => !questionIdSet.has(q._id.toString()),
      );

      uniqueQuestions.forEach((q) => questionIdSet.add(q._id.toString()));

      finalQuestions = finalQuestions.concat(uniqueQuestions);
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

// SUBMIT ATTEMPT
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

    if (session.isExpired()) {
      return res.status(400).json({
        success: false,
        message: "Time expired",
      });
    }

    const questions = await Question.find({
      _id: { $in: session.questions },
    });

    let score = 0;
    let correct = 0;
    let wrong = 0;

    const evaluatedAnswers = [];

    for (let question of questions) {
      const ans = answers.find((a) => a.questionId === question._id.toString());

      const correctAnswer = question.correct;

      const correctOptionObj = question.options.find(
        (opt) => opt.id.toLowerCase() === correctAnswer.toLowerCase(),
      );

      const selectedOption = ans?.selectedOption || null;

      const selectedOptionObj = question.options.find(
        (opt) => opt.id.toLowerCase() === selectedOption?.toLowerCase(),
      );

      const isCorrect =
        selectedOption?.toLowerCase() === correctAnswer.toLowerCase();

      if (selectedOption) {
        if (isCorrect) {
          score++;
          correct++;
        } else {
          wrong++;
        }
      }

      evaluatedAnswers.push({
        questionId: question._id,
        question: question.question,
        options: question.options,
        selectedOption,
        selectedAnswerText: selectedOptionObj?.text || "Not answered",
        correctAnswer,
        correctAnswerText: correctOptionObj?.text || "Answer not available",
        isCorrect,
      });
    }

    const completedAt = new Date();
    const timeTaken = Math.floor(
      (completedAt - new Date(session.startedAt)) / 1000,
    );

    session.answers = evaluatedAnswers;
    session.score = score;
    session.correctAnswers = correct;
    session.wrongAnswers = wrong;
    session.timeTaken = timeTaken;
    session.isCompleted = true;
    session.completedAt = completedAt;

    await session.save();

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

// HISTORY
export const getAttemptHistory = async (req, res, next) => {
  try {
    const attempts = await QuizSession.find({
      user: req.user.id,
    })
      .populate("user", "name email")
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts.map((a) => ({
        attemptId: a._id,
        userName: a.user?.name,
        quizTitle: a.quizId?.title,
        score: a.score,
        totalQuestions: a.totalQuestions,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
export const getAttemptById = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizSession.findById(attemptId)
      .populate("user", "name")
      .populate("quizId", "title")
      .populate({
        path: "questions",
        select: "question options correct",
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        userName: attempt.user?.name,
        title: attempt.quizId?.title,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        timeTaken: attempt.timeTaken,
        questions: attempt.questions.map((q) => {
          const ans = attempt.answers?.find(
            (a) => a.questionId?.toString() === q._id.toString(),
          );

          const correctOption = q.options?.find((opt) => opt.id === q.correct);

          const selectedOption = q.options?.find(
            (opt) => opt.id === ans?.selectedOption,
          );

          return {
            questionId: q._id,
            question: q.question,
            options: q.options,
            selectedOption: ans?.selectedOption || null,
            selectedAnswerText: selectedOption?.text || "Not answered",
            correctAnswer: q.correct,
            correctAnswerText: correctOption?.text || "",
            isCorrect: ans?.isCorrect || false,
          };
        }),
      },
    });
  } catch (err) {
    next(err);
  }
};
