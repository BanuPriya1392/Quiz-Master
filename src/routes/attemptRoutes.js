import express from "express";
import {
  startAttempt,
  submitAttempt,
  getAttemptHistory,
  getAttemptById,
  startCombinedAttempt,
} from "../controllers/quizAttemptController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// History (keep before dynamic param)
router.get("/history", verifyToken, getAttemptHistory);

// Get attempt by ID
router.get("/:attemptId", verifyToken, getAttemptById);

// Start single quiz
router.post("/:quizId/start", verifyToken, startAttempt);

// Start combined quiz
router.post("/start-combined", verifyToken, startCombinedAttempt);

// Submit attempt (IMPORTANT: use sessionId)
router.post("/submit/:sessionId", verifyToken, submitAttempt);

export default router;