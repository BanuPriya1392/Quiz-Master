import Quiz from "../models/Quiz.js";
import Question from "../models/Questions.js";

// GET /api/quizzes (only published)
export const getAllQuizzes = async (req, res, next) => {
  try {
    const { category } = req.query;

    const query = { status: "published" };

    if (category) {
      query.category = category;
    }

    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/:quizId
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate("createdBy", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    //  FIX: fetch using quizId
    const questions = await Question.find({
      quizId: quiz._id,
    }).select("-correct -tip");

    res.status(200).json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/quizzes
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, categoryId, difficulty, moduleIds } = req.body;

    if (!title || !categoryId || !moduleIds || moduleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "title, categoryId, moduleIds are required",
      });
    }

    const existing = await Quiz.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Quiz title already exists",
      });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      description,
      category: categoryId,
      modules: moduleIds, // keep as is
      difficulty: difficulty || "easy",
      totalQues: 0,
      status: "unpublished",
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/quizzes/:quizId
export const updateQuiz = async (req, res, next) => {
  try {
    const { title, description, categoryId, difficulty, moduleIds } = req.body;

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description;
    if (categoryId) updateData.category = categoryId;
    if (difficulty) updateData.difficulty = difficulty;
    if (moduleIds) updateData.modules = moduleIds;

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz updated",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted",
    });
  } catch (err) {
    next(err);
  }
};

// PUBLISH
export const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    //  FIX: count using quizId
    const questionCount = await Question.countDocuments({
      quizId: quiz._id,
    });

    if (questionCount < 3) {
      return res.status(400).json({
        success: false,
        message: `Need at least 3 questions. Now: ${questionCount}`,
      });
    }

    quiz.totalQues = questionCount;
    quiz.status = "published";
    quiz.publishedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz published",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};

// UNPUBLISH
export const unpublishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      {
        status: "unpublished",
        publishedAt: null,
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz unpublished",
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
};