// Import validation methods
import { body } from "express-validator";


export const registerValidator = [

  // Validate Name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  // Validate Email
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  // Validate Password
  body("password")
  .notEmpty()
  .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")

];


export const loginValidator = [

  // Validate Email
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required"),

  // Validate Password
  body("password")
    .notEmpty()
    .withMessage("Password required")

];