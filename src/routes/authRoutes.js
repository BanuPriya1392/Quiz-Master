// Import express
import express from "express";

// Import controller functions
import {
  registerUser,
  loginUser
} from "../controllers/authController.js";

// Import validation rules
import {
  registerValidator,
  loginValidator
} from "../validators/authValidator.js";

// Import middleware to check validation errors
import validateRequest from "../middleware/validateRequest.js";

// Create router
const router = express.Router();

// ================= REGISTER USER =================
// Endpoint: POST /api/auth/register
router.post(
  "/register",

  // Run validation rules
  registerValidator,

  // Check validation errors
  validateRequest,

  // Call controller
  registerUser
);


// ================= LOGIN USER =================
// Endpoint: POST /api/auth/login
router.post(
  "/login",

  // Validate login fields
  loginValidator,

  // Check validation errors
  validateRequest,

  // Call controller
  loginUser
);


// Export router
export default router;