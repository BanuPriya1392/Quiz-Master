import express from "express";
import {
  getAppOverview,
  getQuizPerformance,
  getUserPerformance,
} from "../controllers/adminAnalyticsController.js";

import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/overview", verifyToken, allowRoles("admin", "mentor"), getAppOverview);

router.get("/quizzes/:quizId", verifyToken, allowRoles("admin", "mentor"), getQuizPerformance);

router.get("/users/:userId", verifyToken, allowRoles("admin", "mentor"), getUserPerformance);

export default router;