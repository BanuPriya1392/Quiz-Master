import mongoose from "mongoose";
import QuizSession from "../models/quizSession.model.js";
import Question from "../models/QuizQuestions.js";

//  START QUIZ
export const startQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "quizId is required",
      });
    }

    //  RETAKE LOGIC 
    const activeSession = await QuizSession.findOne({
      user: req.user.id,
      isCompleted: false,
    });

    if (activeSession) {
      await QuizSession.findByIdAndDelete(activeSession._id);
    }

    //  DAILY ATTEMPT LIMIT
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const attemptsToday = await QuizSession.countDocuments({
      user: req.user.id,
      createdAt: { $gte: todayStart },
    });

    if (attemptsToday >= 10) {
      return res.status(400).json({
        success: false,
        message: "Max 10 attempts per day reached",
      });
    }

    const questions = await Question.aggregate([
      {
        $match: {
          collectionId: new mongoose.Types.ObjectId(quizId),
        },
      },
      { $sample: { size: 10 } },
    ]);

    if (questions.length < 10) {
      return res.status(400).json({
        success: false,
        message: `Not enough questions (${questions.length}/10)`,
      });
    }

    const session = await QuizSession.create({
      user: req.user.id,
      quizId,
      questions: questions.map((q) => q._id),
      totalQuestions: 10,
      startedAt: new Date(),
      isCompleted: false,
    });

    res.status(200).json({
      success: true,
      message: "Quiz started",
      data: {
        sessionId: session._id,
        timeLimit: "10 Minutes",
        questions: questions.map((q) => ({
          _id: q._id,
          question: q.question,
          options: q.options,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

// get quiz questions (for retake or review)
export const endQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const { sessionId } = req.params;

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
        message: "Quiz already completed",
      });
    }

    //  TIMER CHECK
    if (session.isExpired()) {
      return res.status(400).json({
        success: false,
        message: "Time expired",
      });
    }

    if (!answers || answers.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "You must answer exactly 10 questions",
      });
    }

    const questionIds = answers.map(
      (a) => new mongoose.Types.ObjectId(a.questionId)
    );

    const questions = await Question.find({
      _id: { $in: questionIds },
    });

    let score = 0;

    const detailedAnswers = answers.map((ans) => {
      const q = questions.find(
        (q) => q._id.toString() === ans.questionId
      );

      const isCorrect = q && q.correct === ans.selectedOption;

      if (isCorrect) score++;

      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        correctAnswer: q?.correct,
        isCorrect,
      };
    });

    const percentage = Math.round((score / 10) * 100);

    const now = new Date();
    const totalSeconds = Math.floor((now - session.startedAt) / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    // SAVE
    session.score = score;
    session.answers = detailedAnswers || []; // 🔥 FIX
    session.isCompleted = true;
    session.completedAt = now;

    await session.save();

    res.status(200).json({
      success: true,
      message: "Quiz completed",
      data: {
        score,
        percentage,
        timeTaken: formattedTime,
        status: score >= 7 ? "Passed" : "Failed",
      },
    });
  } catch (err) {
    next(err);
  }
};

// get quiz result (score, percentage, status)
export const getQuizResult = async (req, res, next) => {
  try {
    const session = await QuizSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (!session.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Quiz not completed yet",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        score: session.score,
        percentage: Math.round((session.score / 10) * 100),
        status: session.score >= 7 ? "Passed" : "Failed",
        completedAt: session.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// get quiz review (questions, selected options, correct answers)
export const getQuizReview = async (req, res, next) => {
  try {
    const session = await QuizSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

//  FIX: check if answers exist
    if (!session.answers || session.answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No answers found for this session",
      });
    }

    const questions = await Question.find({
      _id: { $in: session.questions },
    });

    const review = session.answers.map((ans) => {
      const q = questions.find(
        (q) => q._id.toString() === ans.questionId
      );

      return {
        question: q?.question,
        options: q?.options,
        selected: ans.selectedOption,
        correct: ans.correctAnswer,
        isCorrect: ans.isCorrect,
        tip: q?.tip,
      };
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// get all attempts for a user 
export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizSession.find({
      user: req.user.id,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .select("score totalQuestions createdAt");

    res.status(200).json({
      success: true,
      total: attempts.length,
      data: attempts.map((a) => ({
        sessionId: a._id,
        score: a.score,
        total: a.totalQuestions,
        percentage: Math.round((a.score / a.totalQuestions) * 100),
        date: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};