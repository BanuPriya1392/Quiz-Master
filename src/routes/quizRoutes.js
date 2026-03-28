import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createBulkQuestions,
  
} from "../controllers/quizController.js";

import {
  validateCreate,
  validateId,
  validateUpdate,
} from "../validators/quizValidator.js";

//  Use correct exports from authMiddleware
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

//all routes are protected, only mentor or admin can access

// GET ALL QUESTIONS
router.get(
  "/",
  protect,
  authorizeRoles("mentor", "admin"),
  getAllQuestions
);

// GET QUESTION BY ID 
router.get(
  "/:id",
  protect,
  authorizeRoles("mentor", "admin"),
  validateId,
  getQuestionById
);

// CREATE QUESTION
router.post(
  "/",
  protect,
  authorizeRoles("mentor", "admin"),
  validateCreate,
  createQuestion
);

// BULK CREATE
router.post(
  "/bulk",
  protect,
  authorizeRoles("mentor", "admin"),
  createBulkQuestions
);

// UPDATE QUESTION
router.put(
  "/:id",
  protect,
  authorizeRoles("mentor", "admin"),
  validateUpdate,
  updateQuestion
);

// DELETE QUESTION
router.delete(
  "/:id",
  protect,
  authorizeRoles("mentor", "admin"),
  validateId,
  deleteQuestion
);

export default router;