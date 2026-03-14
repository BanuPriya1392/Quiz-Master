import Question from "../models/Quiz.js";

/* ─────────────────────────────────────────────────────────────
   GET /api/mentor/quiz
───────────────────────────────────────────────────────────── */
export const getAllQuestions = async (req, res, next) => {
  try {
    const { title } = req.query;

    // title query 
    const filter = title
      ? { title: { $regex: new RegExp(`^${title.trim()}$`, "i") } }
      : {};

    const questions = await Question.find(filter).sort({ createdAt: 1 });

    // Available titles list
    const availableTitles = await Question.distinct("title");

    res.status(200).json({
      success: true,
      total:           questions.length,
      availableTitles, // ["JavaScript", "HTML", "CSS"]
      data:            questions,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/mentor/quiz
   Body: { title, question, options, correct, tip }
───────────────────────────────────────────────────────────── */
export const createQuestion = async (req, res, next) => {
  try {
    const { title, question, options, correct, tip } = req.body;

    const created = await Question.create({
      title:    title.trim(),
      question: question.trim(),
      options:  options.map((o) => ({ id: o.id, text: o.text.trim() })),
      correct,
      tip:      tip.trim(),
    });

    res.status(201).json({
      success: true,
      message: `Question added to "${title}" quiz successfully.`,
      data:    created,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const updateQuestion = async (req, res, next) => {
  try {
    const { title, question, options, correct, tip } = req.body;

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title:    title.trim(),
        question: question.trim(),
        options:  options.map((o) => ({ id: o.id, text: o.text.trim() })),
        correct,
        tip:      tip.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data:    updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/mentor/quiz/:id
───────────────────────────────────────────────────────────── */
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Question "${req.params.id}" not found.`,
      });
    }
    res.status(200).json({
      success: true,
      message: `Question deleted from "${deleted.title}" quiz successfully.`,
    });
  } catch (err) {
    next(err);
  }
};