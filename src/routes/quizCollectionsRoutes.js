import express from "express";
import {
  createCollection,
  getAllCollections,
  getCollectionById,
  deleteCollection,
} from "../controllers/quizCollection.js";

import { verifyToken,isMentor } from "../middlewares/authMiddleware.js"; 
import { validateCreateCollection } from "../validators/quizValidator.js";

const router = express.Router();

// Create collection
router.post("/", verifyToken,isMentor,validateCreateCollection, createCollection);

// Get all collections
router.get("/",verifyToken, getAllCollections);

// Get single collection
router.get("/:id",verifyToken, getCollectionById);

// Delete collection
router.delete("/:id", verifyToken,isMentor, deleteCollection);

export default router;