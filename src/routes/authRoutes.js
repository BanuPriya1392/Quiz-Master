import express from "express";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/authController.js";

import { registerValidator } from "../validators/authValidator.js";
import validateRequest from "../middlewares/validateRequest.js";

// middleware for protected route
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// REGISTER
router.post(
  "/register",
  registerValidator,
  validateRequest,
  registerUser
);

// LOGIN
router.post("/login", loginUser);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// ✅ RESET PASSWORD (token in body)
router.post("/reset-password", resetPassword);

// CHANGE PASSWORD (protected)
router.put("/change-password", verifyToken, changePassword);

export default router;