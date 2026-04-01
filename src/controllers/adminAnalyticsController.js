import mongoose from "mongoose";
import User from "../models/User.js";
import QuizSession from "../models/quizSession.model.js";

//get app overview
export const getAppOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttempts = await QuizSession.countDocuments();
    const completedAttempts = await QuizSession.countDocuments({
      isCompleted: true,
    });

    const avgScoreData = await QuizSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    const accuracyData = await QuizSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: null,
          totalCorrect: { $sum: "$correctAnswers" },
          totalQuestions: { $sum: "$totalQuestions" },
        },
      },
    ]);

    const averageScore = avgScoreData[0]?.avgScore || 0;

    const accuracy =
      accuracyData[0]?.totalQuestions > 0
        ? (
            (accuracyData[0].totalCorrect / accuracyData[0].totalQuestions) *
            100
          ).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAttempts,
        completedAttempts,
        averageScore: Number(averageScore.toFixed(1)),
        accuracy: `${accuracy}%`,
      },
    });
  } catch (err) {
    console.error("Overview Error:", err);
    next(err);
  }
};

//get quiz performance
export const getQuizPerformance = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const stats = await QuizSession.aggregate([
      {
        $match: {
          quizId: new mongoose.Types.ObjectId(quizId),
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: "$quizId",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          highestScore: { $max: "$score" },
          lowestScore: { $min: "$score" },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: "No attempts for this quiz",
      });
    }

    const data = stats[0];

    res.status(200).json({
      success: true,
      data: {
        quizId,
        totalAttempts: data.totalAttempts,
        averageScore: Math.round(data.avgScore),
        highestScore: data.highestScore,
        lowestScore: data.lowestScore,
      },
    });
  } catch (err) {
    console.error("Quiz Performance Error:", err);
    next(err);
  }
};

//get user performance
export const getUserPerformance = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const stats = await QuizSession.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: "$user",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          totalCorrect: { $sum: "$correctAnswers" },
          totalQuestions: { $sum: "$totalQuestions" },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: "No attempts found for user",
      });
    }

    const data = stats[0];

    const accuracy =
      data.totalQuestions > 0
        ? ((data.totalCorrect / data.totalQuestions) * 100).toFixed(0)
        : 0;

    // recent attempts
    const recentAttempts = await QuizSession.find({
      user: userId,
      isCompleted: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("score createdAt");

    res.status(200).json({
      success: true,
      data: {
        userId,
        totalAttempts: data.totalAttempts,
        averageScore: Math.round(data.avgScore),
        bestScore: data.bestScore,
        accuracy: `${accuracy}%`,
        recentAttempts,
      },
    });
  } catch (err) {
    console.error("User Performance Error:", err);
    next(err);
  }
};