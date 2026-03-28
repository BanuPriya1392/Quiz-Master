import express from "express";
import {
  getProfile,
  updateProfile,
  getProfileStats,
  deleteProfile
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET PROFILE
router.get("/profile", verifyToken, getProfile);

// UPDATE PROFILE
router.put("/profile", verifyToken, updateProfile);

// GET STATS
router.get("/profile/stats", verifyToken, getProfileStats);

// DELETE ACCOUNT
router.delete("/profile", verifyToken, deleteProfile);

export default router;