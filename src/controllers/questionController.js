import Question from "../models/Questions.js";
import { updateTotalQuestions } from "../utils/updateTotalQuestions.js";

// GET ALL QUESTIONS
export const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    const updatedQuestions = questions.map((q) => {
      const correctOption = q.options.find((opt) => opt.id === q.correct);

      return {
        ...q.toObject(),
        correctAnswerText: correctOption?.text || "Not available",
      };
    });

    res.status(200).json({
      success: true,
      total: updatedQuestions.length,
      data: updatedQuestions,
    });
  } catch (err) {
    next(err);
  }
};

// GET QUESTION BY ID
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// CREATE QUESTION
export const createQuestion = async (req, res, next) => {
  try {
    const { quizId, categoryId } = req.body;

    if (!quizId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "quizId and categoryId are required",
      });
    }

    // max 2 questions per quiz
    const existingCount = await Question.countDocuments({ quizId });

    if (existingCount >= 2) {
      return res.status(400).json({
        success: false,
        message: "Only 2 questions allowed for one quiz",
      });
    }

    const newQuestion = await Question.create({
      ...req.body,
      quizId,
      categoryId,
      createdBy: req.user.id,
    });

    await updateTotalQuestions(quizId);

    res.status(201).json({
      success: true,
      message: "Question created",
      data: newQuestion,
    });
  } catch (err) {
    next(err);
  }
};

// BULK CREATE QUESTIONS
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { quizId, categoryId, questions } = req.body;

    if (!quizId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "quizId and categoryId required",
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array required",
      });
    }

    const currentCount = await Question.countDocuments({ quizId });

    if (currentCount + questions.length > 2) {
      return res.status(400).json({
        success: false,
        message: `Only ${2 - currentCount} questions allowed`,
      });
    }

    const docs = questions.map((q) => ({
      ...q,
      quizId,
      categoryId,
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    await updateTotalQuestions(quizId);

    res.status(201).json({
      success: true,
      message: `${created.length} questions added`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE QUESTION
export const updateQuestion = async (req, res, next) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (updated.quizId) {
      await updateTotalQuestions(updated.quizId);
    }

    res.status(200).json({
      success: true,
      message: "Question updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE QUESTION
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (deleted.quizId) {
      await updateTotalQuestions(deleted.quizId);
    }

    res.status(200).json({
      success: true,
      message: "Question deleted",
    });
  } catch (err) {
    next(err);
  }
};

// GET QUESTIONS BY CATEGORY OR QUIZ
export const getQuestionsByCategoryIdOrQuizId = async (req, res, next) => {
  try {
    const { categoryId, quizId } = req.params;

    let filter = {};

    if (quizId) {
      filter.quizId = quizId;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const questions = await Question.find(filter);

    res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};
