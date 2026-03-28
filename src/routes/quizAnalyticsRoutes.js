import express from "express";
import {
  getAppOverview,
  getQuizPerformance,
  getUserPerformance,
} from "../controllers/adminAnalyticsController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// App overview
router.get("/overview", verifyToken, isAdmin, getAppOverview);

// Per-quiz stats
router.get("/quizzes/:quizId", verifyToken, isAdmin, getQuizPerformance);

// Per-user stats
router.get("/users/:userId", verifyToken, isAdmin, getUserPerformance);

export default router;