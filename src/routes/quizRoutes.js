import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/quizController.js";
import {
  validateCreate,
  validateId,
  validateUpdate,
} from "../validators/quizValidator.js";
import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* PUBLIC —(students + mentors) */
router.get("/",    getAllQuestions);
router.get("/:id", validateId, getQuestionById);

/*  PROTECTED — Mentor login token 
   Order: verifyToken → isMentor → validate → controller */
router.post(  "/",    verifyToken, isMentor, validateCreate, createQuestion);
router.put(   "/:id", verifyToken, isMentor, validateUpdate, updateQuestion);
router.delete("/:id", verifyToken, isMentor, validateId,     deleteQuestion);

export default router;