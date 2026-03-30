// src/routes/quizRoutes.js
import express from "express";
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
} from "../controllers/quizController.js";
import { verifyToken, isMentor, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — list all published quizzes, optionally filtered by ?category=
router.get("/", getAllQuizzes);

// Public — get a single quiz with questions
router.get("/:quizId", getQuizById);

// Admin/Mentor only — create, update, delete, publish
router.post("/", verifyToken, isMentor, createQuiz);
router.put("/:quizId", verifyToken, isMentor, updateQuiz);
router.delete("/:quizId", verifyToken, isMentor, deleteQuiz);
router.patch("/:quizId/publish", verifyToken, isMentor, publishQuiz);
router.patch("/:quizId/unpublish", verifyToken, isMentor, unpublishQuiz);

export default router;