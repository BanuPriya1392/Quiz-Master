// src/routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Category CRUD
router.get("/", getAllCategories);
router.post("/", verifyToken, isMentor, createCategory);
router.put("/:categoryId", verifyToken, isMentor, updateCategory);
router.delete("/:categoryId", verifyToken, isMentor, deleteCategory);
router.get("/:categoryId", getCategoryById);

export default router;