import Question from "../models/Questions.js";
import Quiz from "../models/Quiz.js"; //  NEW
import { updateTotalQuestions } from "../utils/updateTotalQuestions.js";
import mongoose from "mongoose";

//  GET ALL QUESTIONS
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

//  GET BY ID
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

//  CREATE QUESTION (UPDATED )
export const createQuestion = async (req, res, next) => {
  try {
    let moduleData = {};
    let quizId = req.body.quizId;

    //  MODULE HANDLE
    if (req.body.moduleId) {
      const module = await Module.findById(req.body.moduleId);
      if (!module)
        return res
          .status(404)
          .json({ success: false, message: "Module not found" });

      moduleData = { moduleId: module._id, moduleName: module.name };

      //  IMPORTANT: FIND QUIZ FROM MODULE
      if (!quizId) {
        const quiz = await Quiz.findOne({ modules: module._id });
        if (!quiz) {
          return res.status(400).json({
            success: false,
            message: "No quiz found for this module",
          });
        }
        quizId = quiz._id;
      }
    }

    //  CREATE QUESTION
    const newQuestion = await Question.create({
      ...req.body,
      ...moduleData,
      quizId, // always attach quizId
      createdBy: req.user.id,
    });

    //  update total questions
    if (quizId) await updateTotalQuestions(quizId);

    res.status(201).json({
      success: true,
      message: "Question created",
      data: newQuestion,
    });
  } catch (err) {
    next(err);
  }
};

//  UPDATE QUESTION
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { moduleId, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array required",
      });
    }

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "moduleId is required",
      });
    }

    //  MODULE
    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    //  FIND QUIZ
    const quiz = await Quiz.findOne({ modules: module._id });
    if (!quiz) {
      return res.status(400).json({
        success: false,
        message: "No quiz found for this module",
      });
    }

    //  MAX 3 CHECK
    const currentCount = await Question.countDocuments({
      moduleId: module._id,
      quizId: quiz._id,
    });

    if (currentCount + questions.length > 3) {
      return res.status(400).json({
        success: false,
        message: `Only ${3 - currentCount} questions allowed for this module`,
      });
    }

    const docs = questions.map((q) => ({
      ...q,
      moduleId: module._id,
      moduleName: module.name,
      quizId: quiz._id,
      createdBy: req.user.id,
    }));

    const created = await Question.insertMany(docs);

    await updateTotalQuestions(quiz._id);

    res.status(201).json({
      success: true,
      message: `${created.length} questions added`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

//  UPDATE
export const updateQuestion = async (req, res, next) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });

    if (updated.quizId) await updateTotalQuestions(updated.quizId);

    res.status(200).json({
      success: true,
      message: "Question updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

//  DELETE
export const deleteQuestion = async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });

    if (deleted.quizId) await updateTotalQuestions(deleted.quizId);

    res.status(200).json({
      success: true,
      message: "Question deleted",
    });
  } catch (err) {
    next(err);
  }
};

//  GET QUESTIONS BY QUIZ
export const getQuestionsByCategoryIdOrQuizId = async (req, res, next) => {
  try {
    const { categoryId, quizId } = req.params;

    //  ONLY quizId based fetch
    const questions = await Question.findById(quizId ?? categoryId);

    res.status(200).json({
      success: true,
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};
