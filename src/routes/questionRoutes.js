// src/routes/questionRoutes.js
import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  createBulkQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCollection
} from "../controllers/questionController.js";

// Use your existing middleware (verifyToken style)
import { verifyToken, isMentor, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

//PUBLIC ROUTES
router.get("/", getAllQuestions);
router.get("/collection/:collectionId", getQuestionsByCollection);
router.get("/:id", getQuestionById);

//protected routes
// Only mentor or admin can manage questions

// CREATE QUESTION
router.post("/", verifyToken, isMentor, createQuestion);

// BULK CREATE
router.post("/bulk", verifyToken, isMentor, createBulkQuestions);

// UPDATE QUESTION
router.put("/:id", verifyToken, isMentor, updateQuestion);

// DELETE QUESTION
router.delete("/:id", verifyToken, isMentor, deleteQuestion);

export default router;