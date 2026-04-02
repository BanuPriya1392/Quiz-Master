// src/controllers/categoryController.js

import mongoose from "mongoose";
import QuizCollection from "../models/QuizCollection.js";
import Module from "../models/Module.js";
import Question from "../models/Questions.js";

//  CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and category are required",
      });
    }

    const newCategory = await QuizCollection.create({
      title: title.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await QuizCollection.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  GET CATEGORY + MODULES
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await QuizCollection.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const modules = await Module.find({ collectionId: id })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        modules,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category.trim();

    const updated = await QuizCollection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


//  DELETE CATEGORY (CASCADE)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await QuizCollection.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete modules
    const modules = await Module.find({ collectionId: id });
    const moduleIds = modules.map((m) => m._id);

    await Module.deleteMany({ collectionId: id });

    // Delete questions
    await Question.deleteMany({
      $or: [
        { collectionId: id },
        { moduleId: { $in: moduleIds } }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Category, modules & questions deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};