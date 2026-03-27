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

import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected and only accessible by mentors

// GET ALL QUESTIONS
router.get(
  "/",
  verifyToken,
  isMentor,
  getAllQuestions
);

// GET QUESTION BY ID
router.get(
  "/:id",
  verifyToken,
  isMentor,
  validateId,
  getQuestionById
);
// CREATE QUESTION
router.post(
  "/",
  verifyToken,
  isMentor,
  validateCreate,
  createQuestion
);
// CREATE BULK QUESTIONS
router.post(
  "/bulk",
  verifyToken,
  isMentor,
  createBulkQuestions
);

// UPDATE QUESTION
router.put(
  "/:id",
  verifyToken,
  isMentor,
  validateUpdate,
  updateQuestion
);

// DELETE QUESTION
router.delete(
  "/:id",
  verifyToken,
  isMentor,
  validateId,
  deleteQuestion
);

export default router;