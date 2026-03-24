import express from "express";
import { 
  createUser,   
  getUserProfile,
  updateUserProfile,
  deleteUser
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//  CREATE USER (PUBLIC)
router.post("/register", createUser);

// GET PROFILE
router.get("/profile", verifyToken, getUserProfile);

//  UPDATE PROFILE
router.put("/profile", verifyToken, updateUserProfile);

//  DELETE PROFILE
router.delete("/profile", verifyToken, deleteUser);

export default router;