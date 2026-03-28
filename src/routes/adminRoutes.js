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
  getAppOverview,        // new
  getQuizPerformance,    //  new
  getUserPerformance     //  new
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



// ─── NEW ANALYTICS ENDPOINTS ─────────────────

// App overview
router.get("/analytics/overview", verifyToken, isAdmin, getAppOverview);

// Per-quiz stats
router.get("/analytics/quizzes/:quizId", verifyToken, isAdmin, getQuizPerformance);

// Per-user stats
router.get("/analytics/users/:userId", verifyToken, isAdmin, getUserPerformance);

export default router;