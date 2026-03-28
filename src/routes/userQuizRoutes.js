import express from "express";
import {
  getQuizQuestions,
  submitQuiz,
  getMyAttempts,
  getAttemptById,
} from "../controllers/quizAttemptController.js";

import { validateSubmitQuiz } from "../validators/quizAttemptValidator.js";

import { verifyToken, isStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET questions
router.get("/", verifyToken, isStudent, getQuizQuestions);

// Submit quiz
router.post("/submit", verifyToken, isStudent, validateSubmitQuiz, submitQuiz);

// My attempts
router.get("/my-attempts", verifyToken, isStudent, getMyAttempts);

// Single attempt
router.get("/my-attempts/:attemptId", verifyToken, isStudent, getAttemptById);

export default router;