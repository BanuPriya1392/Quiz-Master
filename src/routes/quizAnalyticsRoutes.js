import express from "express";
import { getQuizAnalytics } from "../controllers/adminAnalyticsController.js";

const router = express.Router();

router.get("/quiz-analytics", getQuizAnalytics);

export default router;