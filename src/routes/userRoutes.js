import express from "express";
import {
  createUser,
  getUserProfile,
  updateProfile,
  getUserStats,
  deleteProfile
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create user
router.post("/", createUser);

// Profile
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateProfile);

// Stats ✅ Fixed
router.get("/profile/stats", verifyToken, getUserStats);

// Delete account
router.delete("/profile", verifyToken, deleteProfile);

export default router;