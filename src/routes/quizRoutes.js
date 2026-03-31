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

import {
  getQuestionsByCollection,
  createQuestion,
  createBulkQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js"; // ✅ Added

import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTES
 */

// Get all quizzes (published)
router.get("/", getAllQuizzes);

// Get single quiz
router.get("/:quizId", getQuizById);

// ✅ Get all questions of a quiz (uses getQuestionsByCollection — supports quizId)
router.get("/:quizId/questions", verifyToken, getQuestionsByCollection.bind(null)); 


/**
 * PROTECTED ROUTES (Mentor / Admin)
 */

// Create quiz
router.post(
  "/",
  verifyToken,
  allowRoles("mentor", "admin"),
  createQuiz
);

// Update quiz
router.put(
  "/:quizId",
  verifyToken,
  allowRoles("mentor", "admin"),
  updateQuiz
);

// Delete quiz
router.delete(
  "/:quizId",
  verifyToken,
  allowRoles("mentor", "admin"),
  deleteQuiz
);

// Publish quiz
router.patch(
  "/:quizId/publish",
  verifyToken,
  allowRoles("mentor", "admin"),
  publishQuiz
);

// Unpublish quiz
router.patch(
  "/:quizId/unpublish",
  verifyToken,
  allowRoles("mentor", "admin"),
  unpublishQuiz
);

// ✅ Add single question to a quiz
router.post(
  "/:quizId/questions",
  verifyToken,
  allowRoles("mentor", "admin"),
  (req, res, next) => {
    req.body.quizId = req.params.quizId; // ✅ inject quizId into body
    next();
  },
  createQuestion
);

// ✅ Add bulk questions to a quiz
router.post(
  "/:quizId/questions/bulk",
  verifyToken,
  allowRoles("mentor", "admin"),
  (req, res, next) => {
    req.body.collectionId = req.params.quizId; // ✅ inject quizId as collectionId
    next();
  },
  createBulkQuestions
);

// ✅ Update a question
router.put(
  "/:quizId/questions/:questionId",
  verifyToken,
  allowRoles("mentor", "admin"),
  (req, res, next) => {
    req.params.id = req.params.questionId; // ✅ map questionId → id
    next();
  },
  updateQuestion
);

// ✅ Delete a question
router.delete(
  "/:quizId/questions/:questionId",
  verifyToken,
  allowRoles("mentor", "admin"),
  (req, res, next) => {
    req.params.id = req.params.questionId; // ✅ map questionId → id
    next();
  },
  deleteQuestion
);

export default router;