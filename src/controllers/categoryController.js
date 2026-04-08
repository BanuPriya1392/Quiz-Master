import mongoose from "mongoose";
import QuizCollection from "../models/QuizCollection.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Questions.js";

//  CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    //  Prevent duplicate
    const existing = await QuizCollection.findOne({
      title: trimmedName,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = await QuizCollection.create({
      title: trimmedName, // map name → title
      description: description?.trim() || "",
      category: trimmedName, // keeping same value
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

//  GET Quizzes By CategoryID
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    console.log("Incoming ID:", categoryId); // debug

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await QuizCollection.findById({ _id: categoryId });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // const modules = await Quiz.find({ collectionId: categoryId }).sort({
    //   order: 1,
    // });

    const quizzes = await Quiz.findById(categoryId);

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        quizzes
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
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const updateData = {};

    if (name) {
      const trimmedName = name.trim();

      //  Prevent duplicate (excluding same doc)
      const existing = await QuizCollection.findOne({
        title: trimmedName,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        });
      }

      updateData.title = trimmedName;
      updateData.category = trimmedName;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    const updated = await QuizCollection.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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

    //  Delete modules
    const modules = await Module.find({ collectionId: id });
    const moduleIds = modules.map((m) => m._id);

    await Module.deleteMany({ collectionId: id });

    //  Delete questions
    await Question.deleteMany({
      $or: [{ collectionId: id }, { moduleId: { $in: moduleIds } }],
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
