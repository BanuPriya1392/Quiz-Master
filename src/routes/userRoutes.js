import express from "express";
import { 
  getUserProfile,
  updateUserProfile,
  deleteUser
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET PROFILE
router.get("/profile", verifyToken, getUserProfile);

// UPDATE PROFILE
router.put("/profile", verifyToken, updateUserProfile);

// DELETE PROFILE
router.delete("/profile", verifyToken, deleteUser);

export default router;