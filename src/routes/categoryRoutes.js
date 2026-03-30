// src/routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import moduleRouter from "./moduleRoutes.js";
import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyToken, isMentor, createCategory);
router.put("/:id", verifyToken, isMentor, updateCategory);
router.delete("/:id", verifyToken, isMentor, deleteCategory);
router.use("/:id/modules", moduleRouter);
router.get("/:id", getCategoryById);

export default router;