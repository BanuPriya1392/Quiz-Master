import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { registerValidator } from "../validators/authValidator.js";
import validateRequest from "../middlewares/validateRequest.js";

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

export default router;