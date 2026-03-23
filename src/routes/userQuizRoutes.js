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

/* USER QUIZ ROUTES
   Base: /api/user/quiz */

// GET  /api/user/quiz
// Quiz questions fetch
router.get("/", verifyToken, isStudent, getQuizQuestions);

// POST /api/user/quiz/submit
// Quiz submit — score, answers, timeTaken will be saved
router.post("/submit", verifyToken, isStudent, validateSubmitQuiz, submitQuiz);

// GET  /api/user/quiz/my-attempts
// User's attempt history
router.get("/my-attempts", verifyToken, isStudent, getMyAttempts);

// GET  /api/user/quiz/my-attempts/:attemptId
// Single attempt detail — result screen
router.get("/my-attempts/:attemptId", verifyToken, isStudent, getAttemptById);

export default router;
