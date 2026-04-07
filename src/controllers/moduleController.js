// src/controllers/moduleController.js
import mongoose from "mongoose";
import Module from "../models/Module.js";
import Quiz from "../models/Quiz.js";


// CREATE MODULE
export const createModule = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Module name is required",
      });
    }

    const module = await Module.create({
      name: name.trim(),
      collectionId: categoryId,
      order: order || 0,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Module created",
      data: module,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  GET MODULES BY CATEGORY
export const getModulesByCollection = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const modules = await Module.find({ collectionId: categoryId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  GET SINGLE MODULE + QUIZZES
export const getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // only quizzes of this module
    const quizzes = await Quiz.find({ module: moduleId });

    res.status(200).json({
      success: true,
      data: {
        ...module.toObject(),
        quizzes,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// UPDATE MODULE
export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { name, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const updated = await Module.findByIdAndUpdate(
      moduleId,
      {
        ...(name && { name: name.trim() }),
        ...(order !== undefined && { order }),
      },
      { new: true }
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
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  DELETE MODULE
export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findByIdAndDelete(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    //  delete quizzes of this module
    await Quiz.deleteMany({ module: moduleId });

    res.status(200).json({
      success: true,
      message: "Module & related quizzes deleted",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  ADMIN GET ALL MODULES
export const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};