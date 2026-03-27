import Question from "../models/Quiz.js";
import QuizCollection from "../models/QuizCollection.js";

// GET /api/mentor/quiz
export const getAllQuestions = async (req, res, next) => {
  try {
    const { quizId, category, difficulty } = req.query;

    const filter = { createdBy: req.user.id };

    if (quizId) filter.quizId = quizId;
    if (category && category !== "All") filter.category = category;
    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/mentor/quiz/:id
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    }).populate("quizId", "title");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// POST /api/mentor/quiz
export const createQuestion = async (req, res, next) => {
  try {
    const { quizId, category, difficulty, question, options, correct, tip } =
      req.body;

    const created = await Question.create({
      quizId,
      category,
      difficulty,
      question: question.trim(),
      options: options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correct,
      tip: tip.trim(),
      createdBy: req.user.id,
    });

    // Update totalQuestions count
    await QuizCollection.findByIdAndUpdate(quizId, {
      $inc: { totalQuestions: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/mentor/quiz/:id
export const updateQuestion = async (req, res, next) => {
  try {
    const { category, difficulty, question, options, correct, tip } = req.body;

    const updated = await Question.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      {
        category,
        difficulty,
        question: question.trim(),
        options: options.map((o) => ({ id: o.id, text: o.text.trim() })),
        correct,
        tip: tip.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/mentor/quiz/:id
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Update totalQuestions count
    await QuizCollection.findByIdAndUpdate(deleted.quizId, {
      $inc: { totalQuestions: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/mentor/quiz/bulk
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { quizId, category, difficulty, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array required",
      });
    }

    const docs = questions.map((q) => ({
      quizId,
      category,
      difficulty,
      question: q.question.trim(),
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text.trim(),
      })),
      correct: q.correct,
      tip: q.tip.trim(),
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    await QuizCollection.findByIdAndUpdate(quizId, {
      $inc: { totalQuestions: created.length },
    });

    res.status(201).json({
      success: true,
      message: `${created.length} questions added`,
    });
  } catch (err) {
    next(err);
  }
};