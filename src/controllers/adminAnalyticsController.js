import User from "../models/User.js";
import QuizSession from "../models/quizSession.model.js";

// ─── APP OVERVIEW ──────────────────────────────
export const getAppOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttempts = await QuizSession.countDocuments();
    const completedAttempts = await QuizSession.countDocuments({ isCompleted: true });

    const avgScoreData = await QuizSession.aggregate([
      { $match: { isCompleted: true } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);

    const avgScore = avgScoreData[0]?.avgScore || 0;

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalAttempts,
        completedAttempts,
        avgScore: Math.round(avgScore),
      },
    });
  } catch (err) {
    console.error("Overview Error:", err);
    next(err);
  }
};

// ─── PER QUIZ PERFORMANCE ─────────────────────
export const getQuizPerformance = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const sessions = await QuizSession.find({ quizId });

    if (!sessions.length)
      return res.status(404).json({ success: false, message: "No attempts for this quiz" });

    const totalAttempts = sessions.length;
    const avgScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalAttempts;
    const passCount = sessions.filter((s) => s.score >= 7).length;
    const passRate = Math.round((passCount / totalAttempts) * 100);

    res.status(200).json({
      success: true,
      quizPerformance: {
        quizId,
        totalAttempts,
        avgScore: Math.round(avgScore),
        passRate,
      },
    });
  } catch (err) {
    console.error("Quiz Performance Error:", err);
    next(err);
  }
};

// ─── PER USER PERFORMANCE ─────────────────────
export const getUserPerformance = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sessions = await QuizSession.find({ user: userId, isCompleted: true });

    if (!sessions.length)
      return res.status(404).json({ success: false, message: "No attempts found for user" });

    const totalAttempts = sessions.length;
    const avgScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalAttempts;
    const bestScore = Math.max(...sessions.map((s) => s.score));

    const recentAttempts = sessions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((a) => ({ score: a.score, date: a.createdAt }));

    res.status(200).json({
      success: true,
      userPerformance: {
        userId,
        totalAttempts,
        avgScore: Math.round(avgScore),
        bestScore,
        recentAttempts,
      },
    });
  } catch (err) {
    console.error("User Performance Error:", err);
    next(err);
  }
};