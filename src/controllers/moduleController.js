// src/controllers/moduleController.js

import Module from "../models/Module.js";
import Question from "../models/Questions.js";


//  POST /api/categories/:id/modules
export const createModule = async (req, res, next) => {
  try {
    const collectionId = req.params.id;
    const body = req.body;

   //bulks insert
    if (Array.isArray(body)) {

      const modulesToInsert = body.map((item, index) => {
        if (!item.name || typeof item.name !== "string") {
          throw new Error(`Invalid name at index ${index}`);
        }

        return {
          name: item.name.trim().toLowerCase(),
          order: item.order ?? 0,
          collectionId,
          createdBy: req.user?.id,
        };
      });

      const created = await Module.insertMany(modulesToInsert);

      return res.status(201).json({
        success: true,
        message: `${created.length} modules created`,
        data: created,
      });
    }

   // Single insert
    const { name, order } = body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Module name is required and must be a string",
      });
    }

    const cleanName = name.trim().toLowerCase();

    const existing = await Module.findOne({ name: cleanName, collectionId });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Module "${name}" already exists`,
      });
    }

    const module = await Module.create({
      name: cleanName,
      order: order ?? 0,
      collectionId,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Module created",
      data: module,
    });

  } catch (err) {
    next(err);
  }
};



// GET /api/categories/:id/modules
export const getModulesByCollection = async (req, res, next) => {
  try {
    const collectionId = req.params.id;

    const modules = await Module.find({ collectionId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      total: modules.length,
      data: modules,
    });

  } catch (err) {
    next(err);
  }
};



// POST /api/categories/:id/modules/:moduleId/questions
export const addQuestionsToModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { questions } = req.body;

    // Validate module
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array required",
      });
    }

    //  Limit (max 3)
    const currentCount = await Question.countDocuments({
      moduleId: module._id,
    });

    if (currentCount >= 3) {
      return res.status(400).json({
        success: false,
        message: `Module "${module.name}" already has 3 questions`,
      });
    }

    if (currentCount + questions.length > 3) {
      return res.status(400).json({
        success: false,
        message: `Only ${3 - currentCount} more questions allowed`,
      });
    }

    //  Prepare docs
    const docs = questions.map((q) => {
      if (!q.question || !q.options || !q.correct) {
        throw new Error("Invalid question format");
      }

      return {
        ...q,
        moduleId: module._id,
        moduleName: module.name,
        collectionId: module.collectionId,
        createdBy: req.user?.id,
      };
    });

    //  Insert
    const created = await Question.insertMany(docs);

    // Update total questions
    const count = await Question.countDocuments({
      moduleId: module._id,
    });

    await Module.findByIdAndUpdate(moduleId, {
      totalQues: count,
    });

    res.status(201).json({
      success: true,
      message: `${created.length} questions added`,
      data: created,
    });

  } catch (err) {
    next(err);
  }
};



// PATCH /api/categories/:id/modules/:moduleId
export const updateModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { name, order } = req.body;

    const updateData = {};

    //  Safe update
    if (name) {
      updateData.name = name.trim().toLowerCase();
    }

    if (order !== undefined) {
      updateData.order = order;
    }

    const updated = await Module.findByIdAndUpdate(
      moduleId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Module updated",
      data: updated,
    });

  } catch (err) {
    next(err);
  }
};



//  DELETE /api/categories/:id/modules/:moduleId
export const deleteModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findByIdAndDelete(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Delete related questions
    await Question.deleteMany({ moduleId: module._id });

    res.status(200).json({
      success: true,
      message: "Module and related questions deleted",
    });

  } catch (err) {
    next(err);
  }
};



// GET /api/categories/:id/modules/all  (admin)
export const getAllModules = async (req, res, next) => {
  try {
    const modules = await Module.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: modules.length,
      data: modules,
    });

  } catch (err) {
    next(err);
  }
};