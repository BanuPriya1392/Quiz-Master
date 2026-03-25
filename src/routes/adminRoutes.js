import express from "express";
import {
  createUser,
  getUsers,
  updateUserStatus,
  getUserById,
  deleteUser,
  updateUserRole
} from "../controllers/adminController.js";

// import auth middleware
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create user (Admin)
router.post("/", verifyToken, isAdmin, createUser);

// Other routes
router.get("/", verifyToken, isAdmin, getUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.patch("/:id/status", verifyToken, isAdmin, updateUserStatus);
router.patch("/:id/role", verifyToken, isAdmin, updateUserRole);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;