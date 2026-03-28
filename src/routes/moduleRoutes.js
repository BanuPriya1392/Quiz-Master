// src/routes/moduleRoutes.js
import express from "express";
import {
  createModule,
  getModulesByCollection,
  addQuestionsToModule,
  updateModule,
  deleteModule,
  getAllModules
} from "../controllers/moduleController.js";
import { verifyToken, isMentor } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isMentor, createModule);
router.get("/collection/:collectionId", verifyToken, getModulesByCollection);
router.post("/:moduleId/questions", verifyToken, isMentor, addQuestionsToModule);
router.patch("/:moduleId", verifyToken, isMentor, updateModule);
router.delete("/:moduleId", verifyToken, isMentor, deleteModule);
router.get("/", verifyToken, getAllModules);

export default router;