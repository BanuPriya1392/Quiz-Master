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
import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router({ mergeParams: true }); // ← critical

// /api/categories/:categoryId/modules
router.get("/", verifyToken, getModulesByCollection);
router.post("/", verifyToken, isMentor, createModule);

// /api/categories/:categoryId/modules/:moduleId
router.patch("/:moduleId", verifyToken, isMentor, updateModule);
router.delete("/:moduleId", verifyToken, isMentor, deleteModule);

// /api/categories/:categoryId/modules/:moduleId/questions
router.post("/:moduleId/questions", verifyToken, isMentor, addQuestionsToModule);

// standalone - get all modules (admin use)
router.get("/all", verifyToken, getAllModules);

export default router;