import express from "express";
import {
  startQuizSession,
  completeQuizSession,
} from "../controllers/quizSession.controller.js";
import { verifyToken, isStudent } from "../middlewares/authMiddleware.js"; // ✅ isStudent import

const router = express.Router();


router.post("/start", verifyToken, isStudent, startQuizSession);
router.put("/complete/:sessionId", verifyToken, isStudent, completeQuizSession);

export default router;