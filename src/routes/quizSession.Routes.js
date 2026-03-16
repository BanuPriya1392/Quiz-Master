import express from "express";
import {
  startQuizSession,
  completeQuizSession,
} from "../controllers/quizSession.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student — Start quiz session
router.post("/start", verifyToken, startQuizSession);

// Student — Complete quiz session
router.put("/complete/:sessionId", verifyToken, completeQuizSession);

export default router;