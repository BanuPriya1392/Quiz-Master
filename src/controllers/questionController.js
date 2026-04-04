import Question from "../models/Questions.js";
import { updateTotalQuestions } from "../utils/updateTotalQuestions.js";

import mongoose from "mongoose";          
import Module from "../models/Module.js";

// get all questions
export const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    const updatedQuestions = questions.map((q) => {
      const correctOption = q.options.find(
        (opt) => opt.id === q.correct
      );

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
    let moduleData = {};

    if (req.body.moduleId) {
     
      const module = await Module.findById(req.body.moduleId);
      if (!module) return res.status(404).json({ success: false, message: "Module not found" });
      moduleData = { moduleId: module._id, moduleName: module.name };

    } else if (req.body.moduleName) {
      
      const module = await Module.findOne({ 
        name: req.body.moduleName,
        collectionId: req.body.collectionId 
      });
      if (!module) return res.status(404).json({ success: false, message: `Module "${req.body.moduleName}" not found` });
      moduleData = { moduleId: module._id, moduleName: module.name };
    }

    const newQuestion = await Question.create({ 
      ...req.body, 
      ...moduleData,         
      createdBy: req.user.id 
    });

    if (req.body.collectionId) await updateTotalQuestions(req.body.collectionId);

    res.status(201).json({ success: true, message: "Question created", data: newQuestion });
  } catch (err) {
    next(err);
  }
};

// create bulk questions
export const createBulkQuestions = async (req, res, next) => {
  try {
    const { collectionId, moduleId, moduleName, questions } = req.body; 

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Questions array required" });
    }

    if (!collectionId) {
      return res.status(400).json({ success: false, message: "collectionId is required" });
    }

    let moduleData = {};

    if (moduleId) {
      const module = await Module.findById(moduleId);
      if (!module) return res.status(404).json({ success: false, message: "Module not found" });
      moduleData = { moduleId: module._id, moduleName: module.name };

    } else if (moduleName) {
      const module = await Module.findOne({ name: moduleName, collectionId });
      if (!module) return res.status(404).json({ success: false, message: `Module "${moduleName}" not found` });
      moduleData = { moduleId: module._id, moduleName: module.name };
    }

    // ── Max 3 check — module fetch ஆனதுக்கு அப்புறம் இங்க add பண்ணு ──
    if (moduleData.moduleId) {
      const currentCount = await Question.countDocuments({ moduleId: moduleData.moduleId });

      if (currentCount >= 3) {
        return res.status(400).json({
          success: false,
          message: `Module "${moduleData.moduleName}" already has ${currentCount}/3 questions. No more allowed.`,
        });
      }

      if (currentCount + questions.length > 3) {
        return res.status(400).json({
          success: false,
          message: `Module "${moduleData.moduleName}" has ${currentCount}/3. You can only add ${3 - currentCount} more.`,
        });
      }
    }
  
    const docs = questions.map((q) => ({
      ...q,
      collectionId,
      ...moduleData,
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
    const { grouped } = req.query;

    if (grouped === "true") {
      const result = await Question.aggregate([
        {
          $match: {
            $or: [
              { collectionId: new mongoose.Types.ObjectId(collectionId) },
              { quizId: new mongoose.Types.ObjectId(collectionId) },
            ],
          },
        },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: { moduleId: "$moduleId", moduleName: "$moduleName" },
            questions: { $push: "$$ROOT" },
          },
        },
      ]);

      const formatted = {};

      result.forEach(({ _id, questions }) => {
        const key = _id.moduleName ?? "unassigned";

        const updatedQuestions = questions.map((q) => {
          const correctOption = q.options.find(
            (opt) => opt.id === q.correct
          );

          return {
            ...q,
            correctAnswerText: correctOption?.text || "Not available",
          };
        });

        formatted[key] = updatedQuestions;
      });

      return res.status(200).json({ success: true, data: formatted });
    }

    const questions = await Question.find({
      $or: [{ collectionId }, { quizId: collectionId }],
    });

   
    const updatedQuestions = questions.map((q) => {
      const correctOption = q.options.find(
        (opt) => opt.id === q.correct
      );

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