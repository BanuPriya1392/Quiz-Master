import express from "express";
import { 
  createUser,   
  getUserProfile,
  updateUserProfile,
  deleteUser
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE USER
router.post("/register", createUser);

//  GET PROFILE
router.get("/profile", verifyToken, getUserProfile);

// UPDATE PROFILE
router.put("/profile", verifyToken, updateProfile);

// GET STATS
router.get("/profile/stats", verifyToken, getProfileStats);

// DELETE ACCOUNT
router.delete("/profile", verifyToken, deleteProfile);

export default router;