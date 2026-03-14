import { body } from "express-validator";

export const registerValidator = [

  // Full Name validation
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),

  // Password validation
  body("password")
    .isString()
    .withMessage("Password must be a characters")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter"),

  // Confirm password validation
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {

      if (String(value).trim()!== String(req.body.password).trim()) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),

  // Terms agreement validation
  body("agreeToTerms")
    .equals("true")
    .withMessage("You must agree to the terms")

];