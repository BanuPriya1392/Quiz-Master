import express from "express";

// USER CONTROLLERS
import {
  createUser,
  getUsers,
  updateUserStatus,
  getUserById,
  deleteUser,
  updateUserRole,
} from "../controllers/adminController.js";

// ANALYTICS CONTROLLER
import {
  getQuizAnalytics,
  getCategoryAnalytics,
  getPerformanceTrends,
  getTopQuizzes
} from "../controllers/adminAnalyticsController.js";
// AUTH MIDDLEWARE
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =========================================
   USER MANAGEMENT ROUTES
========================================= */

// Create user (Admin only)
router.post("/users", verifyToken, isAdmin, createUser);

// Get all users
router.get("/users", verifyToken, isAdmin, getUsers);

// Get single user
router.get("/users/:id", verifyToken, isAdmin, getUserById);

// Update user status
router.patch("/users/:id/status", verifyToken, isAdmin, updateUserStatus);

// Update user role
router.patch("/users/:id/role", verifyToken, isAdmin, updateUserRole);

// Delete user
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);


/* =========================================
   QUIZ ANALYTICS ROUTES
========================================= */

// Main Analytics API
router.get("/quiz-analytics", verifyToken, isAdmin, getQuizAnalytics);
router.get("/quiz-analytics/categories", verifyToken, isAdmin, getCategoryAnalytics);
router.get("/quiz-analytics/trends", verifyToken, isAdmin, getPerformanceTrends);
router.get("/quiz-analytics/top-quizzes", verifyToken, isAdmin, getTopQuizzes);


export default router;