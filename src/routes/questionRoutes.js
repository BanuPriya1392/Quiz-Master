

import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createBulkQuestions,
  getQuestionsByCollection

} from "../controllers/question.js";

import {
  validateCreate,
  validateId,
  validateUpdate,
  validateBulkCreate,
  maxTenQuestionsPerTitle
} from "../validators/quizValidator.js";

import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* PUBLIC (or restrict as needed) */
router.get("/", verifyToken, getAllQuestions);
router.get("/:id", validateId, getQuestionById);

/* PROTECTED — Mentor */
router.post("/", verifyToken, isMentor, validateCreate, maxTenQuestionsPerTitle, createQuestion);

router.put(
  "/:id",
  verifyToken,
  isMentor,
  validateUpdate,
  updateQuestion
);

router.delete(
  "/:id",
  verifyToken,
  isMentor,
  validateId,
  deleteQuestion
);

//  IMPORTANT: keep /bulk BEFORE /:id
router.post(
  "/bulk",
  verifyToken,
  isMentor,
  validateBulkCreate,
  createBulkQuestions,maxTenQuestionsPerTitle
);

router.get("/collection/:collectionId", verifyToken
  ,getQuestionsByCollection
  
);

export default router;