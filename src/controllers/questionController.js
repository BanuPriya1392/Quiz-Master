import Question from "../models/QuizQuestions.js";
import { updateTotalQuestions } from "../utils/updateTotalQuestions.js";

// get all questions
export const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: questions.length, data: questions });
  } catch (err) {
    next(err);
  }
};

// get question by id
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// create new question
export const createQuestion = async (req, res, next) => {
  try {
    const newQuestion = await Question.create({ ...req.body, createdBy: req.user.id });
    if (req.body.collectionId) await updateTotalQuestions(req.body.collectionId);

    res.status(201).json({ success: true, message: "Question created", data: newQuestion });
  } catch (err) {
    next(err);
  }
};

// create bulk questions
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { collectionId, questions } = req.body;

    //  FIX: ensure it's an array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array required",
      });
    }

    if (!collectionId) {
      return res.status(400).json({
        success: false,
        message: "collectionId is required",
      });
    }

    const docs = questions.map((q) => ({
      ...q,
      collectionId,
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    await updateTotalQuestions(collectionId);

    res.status(201).json({
      success: true,
      message: `${created.length} questions added`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

// update question by id
export const updateQuestion = async (req, res, next) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Question not found" });

    if (req.body.quizId) await updateTotalQuestions(req.body.quizId);

    res.status(200).json({ success: true, message: "Question updated", data: updated });
  } catch (err) {
    next(err);
  }
};

// delete question by id
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Question not found" });

    if (deleted.quizId) await updateTotalQuestions(deleted.quizId);

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (err) {
    next(err);
  }
};

// get questions by collectionId or quizId
export const getQuestionsByCollection = async (req, res, next) => {
  try {
    const { collectionId } = req.params;

    const questions = await Question.find({
      $or: [
        { collectionId: collectionId },
        { quizId: collectionId } 
      ]
    });

    res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};