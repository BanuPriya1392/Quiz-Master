// src/routes/moduleRoutes.js
import express from "express";
import {
  createModule,
  getModulesByCollection,
  addQuestionsToModule,
  updateModule,
  deleteModule,
  getAllModules,
} from "../controllers/moduleController.js";

import { verifyToken, allowRoles } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true });

/**
 * CATEGORY MODULE ROUTES
 * /api/categories/:categoryId/modules
 */

// Get modules by category
router.get("/", verifyToken, getModulesByCollection);

// Create module
router.post(
  "/",
  verifyToken,
  allowRoles("mentor", "admin"),
  createModule
);

/**
 * SINGLE MODULE ROUTES
 * /api/categories/:categoryId/modules/:moduleId
 */

// Update module
router.patch(
  "/:moduleId",
  verifyToken,
  allowRoles("mentor", "admin"),
  updateModule
);

// Delete module
router.delete(
  "/:moduleId",
  verifyToken,
  allowRoles("mentor", "admin"),
  deleteModule
);

/**
 * MODULE QUESTIONS
 */

// Add questions to module
router.post(
  "/:moduleId/questions",
  verifyToken,
  allowRoles("mentor", "admin"),
  addQuestionsToModule
);

/**
 * ADMIN ROUTE
 */

// Get all modules
router.get(
  "/all",
  verifyToken,
  allowRoles("admin"),
  getAllModules
);

export default router;