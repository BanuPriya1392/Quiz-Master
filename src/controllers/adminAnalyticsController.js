import QuizCollection from "../models/QuizCollection.js";
import QuizSession from "../models/quizSession.model.js";

export const getQuizAnalytics = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      category = "All",
      status = "All",
      sortBy = "title",
      order = "asc",
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 5;

    // ---------------------------
    // 1. FILTER
    // ---------------------------
    let matchQuery = {};

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category !== "All") {
      matchQuery.category = category;
    }

    if (status !== "All") {
      matchQuery.status = status;
    }

    // ---------------------------
    // 2. AGGREGATION
    // ---------------------------
    const analytics = await QuizCollection.aggregate([
      { $match: matchQuery },

      {
        $lookup: {
          from: "quizsessions", // ⚠️ must match DB collection name
          localField: "_id",
          foreignField: "quizId",
          as: "sessions",
        },
      },

      {
        $addFields: {
          attempts: { $size: "$sessions" },
          avgScore: { $ifNull: [{ $avg: "$sessions.score" }, 0] },
          completion: {
            $ifNull: [{ $avg: "$sessions.completionRate" }, 0],
          },
        },
      },

      {
        $project: {
          title: 1,
          category: 1,
          difficulty: 1,
          totalQues: 1,
          status: 1,
          attempts: 1,
          avgScore: 1,
          completion: 1,
        },
      },

      {
        $sort: {
          [sortBy]: order === "asc" ? 1 : -1,
        },
      },
    ]);

    // ---------------------------
    // 3. OVERVIEW
    // ---------------------------
    const totalQuizzes = analytics.length;

    const totalAttempts = analytics.reduce(
      (acc, item) => acc + (item.attempts || 0),
      0
    );

    const overallAvgScore =
      totalQuizzes > 0
        ? Math.round(
            analytics.reduce((acc, i) => acc + (i.avgScore || 0), 0) /
              totalQuizzes
          )
        : 0;

    const avgCompletionRate =
      totalQuizzes > 0
        ? Math.round(
            analytics.reduce((acc, i) => acc + (i.completion || 0), 0) /
              totalQuizzes
          )
        : 0;

    // ---------------------------
    // 4. CHART DATA (Top 5)
    // ---------------------------
    const chartData = [...analytics]
      .sort((a, b) => (b.attempts || 0) - (a.attempts || 0))
      .slice(0, 5)
      .map((quiz) => ({
        name:
          quiz.title && quiz.title.length > 12
            ? quiz.title.substring(0, 10) + "..."
            : quiz.title || "Untitled",
        attempts: quiz.attempts || 0,
      }));

    // ---------------------------
    // 5. PAGINATION
    // ---------------------------
    const startIndex = (pageNum - 1) * limitNum;

    const paginatedData = analytics.slice(
      startIndex,
      startIndex + limitNum
    );

    // ---------------------------
    // 6. RESPONSE
    // ---------------------------
    res.status(200).json({
      success: true,
      analyticsOverview: {
        totalQuizzes,
        totalAttempts,
        avgCompletionRate,
        overallAvgScore,
      },
      chartData,
      quizTableData: paginatedData,
      pagination: {
        total: totalQuizzes,
        page: pageNum,
        pages: Math.ceil(totalQuizzes / limitNum),
      },
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    next(err);
  }
};

export const getCategoryAnalytics = async (req, res, next) => {
  try {
    const categoryStats = await QuizCollection.aggregate([
      {
        $lookup: {
          from: "quizsessions",
          localField: "_id",
          foreignField: "quizId",
          as: "sessions",
        },
      },

      {
        $addFields: {
          attempts: { $size: "$sessions" },
          avgScore: { $ifNull: [{ $avg: "$sessions.score" }, 0] },
        },
      },

      {
        $group: {
          _id: "$category",

          participation: { $sum: "$attempts" },

          avgScore: { $avg: "$avgScore" },

          totalQuizzes: { $sum: 1 },

          avgDifficulty: {
            $push: "$difficulty",
          },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          participation: 1,
          successRate: { $round: ["$avgScore", 0] },

          // Pick most frequent difficulty (simple version)
          avgDifficulty: {
            $cond: [
              { $gte: [{ $size: "$avgDifficulty" }, 1] },
              { $arrayElemAt: ["$avgDifficulty", 0] },
              "easy",
            ],
          },
        },
      },

      {
        $sort: { participation: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      categoryAnalysis: categoryStats,
    });

  } catch (err) {
    console.error("Category Analytics Error:", err);
    next(err);
  }
};

export const getPerformanceTrends = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    // last N days filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const trends = await QuizSession.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          attempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },

      {
        $project: {
          _id: 0,
          date: "$_id",
          attempts: 1,
          avgScore: { $round: ["$avgScore", 0] },
        },
      },

      {
        $sort: { date: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      performanceTrends: {
        timeRange: `Last ${days} Days`,
        chartData: trends,
      },
    });

  } catch (err) {
    console.error("Performance Trends Error:", err);
    next(err);
  }
};

export const getTopQuizzes = async (req, res, next) => {
  try {
    const topQuizzes = await QuizCollection.aggregate([
      {
        $lookup: {
          from: "quizsessions",
          localField: "_id",
          foreignField: "quizId",
          as: "sessions",
        },
      },

      {
        $addFields: {
          attempts: { $size: "$sessions" },
        },
      },

      {
        $project: {
          title: 1,
          category: 1,
          attempts: 1,
        },
      },

      {
        $sort: { attempts: -1 },
      },

      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      topQuizzes,
    });

  } catch (err) {
    console.error("Top Quizzes Error:", err);
    next(err);
  }
};