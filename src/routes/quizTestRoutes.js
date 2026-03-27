import express from "express";
import {
  startQuiz,
  submitQuiz,
} from "../controllers/quizTestController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 *  START QUIZ
 * GET /api/quiz/start/:collectionId
 * - Fetch quiz + questions (without correct answer)
 */
router.get("/start/:collectionId", verifyToken, startQuiz);

/**
 *  SUBMIT QUIZ
 * POST /api/quiz/submit
 * - Evaluate answers and return score
 */
router.post("/submit", verifyToken, submitQuiz);

export default router;