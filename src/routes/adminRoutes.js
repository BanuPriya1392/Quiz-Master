// src/routes/adminRoutes.js

import express from "express";
import {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

// For admin/mentor to manage questions within quizzes
import { verifyToken, isAdminOrMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

//get all questions for a quiz
router.get(
  "/quizzes/:quizId/questions",
  verifyToken,
  isAdminOrMentor, 
  (req, res, next) => {
    req.query.collectionId = req.params.quizId;
    next();
  },
  getAllQuestions
);

//create question for a quiz
router.post(
  "/quizzes/:quizId/questions",
  verifyToken,
  isAdminOrMentor, 
  (req, res, next) => {
    req.body.collectionId = req.params.quizId;
    next();
  },
  createQuestion
);

//update question by id
router.put(
  "/quizzes/:quizId/questions/:questionId",
  verifyToken,
  isAdminOrMentor,
  (req, res, next) => {
    req.params.id = req.params.questionId;
    next();
  },
  updateQuestion
);

//delete question by id
router.delete(
  "/quizzes/:quizId/questions/:questionId",
  verifyToken,
  isAdminOrMentor, 
  (req, res, next) => {
    req.params.id = req.params.questionId;
    next();
  },
  deleteQuestion
);

export default router;