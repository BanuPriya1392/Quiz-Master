import express from "express";
import { registerUser } from "../controllers/authController.js";
import { registerValidator } from "../validators/authValidator.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post("/register", registerValidator, validate, registerUser);
//router.post("/login", loginUser);

export default router;
