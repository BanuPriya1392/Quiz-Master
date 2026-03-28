import express from "express";
import {
  startQuiz,
  endQuiz,
  getQuizResult,
  getQuizReview,
   getMyAttempts 
} from "../controllers/quizController.js";

import { verifyToken, isStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", verifyToken, isStudent, startQuiz);
router.post("/end/:sessionId", verifyToken, isStudent, endQuiz);
router.get("/result/:sessionId", verifyToken, isStudent, getQuizResult);
router.get("/review/:sessionId", verifyToken, isStudent, getQuizReview);
router.get("/attempts", verifyToken, isStudent, getMyAttempts);

export default router;