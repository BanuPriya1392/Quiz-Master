import { body } from "express-validator";

export const registerValidator = [
  // Name validation
  body("name").notEmpty().withMessage("Full Name is required").trim(),

  // Email validation
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .matches(/\S+@\S+\.\S+/)
    .withMessage("Email is invalid"),

  // Password validation
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain a special character")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter"),

  // Confirm password
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  // Agree to terms
  body("agreeToTerms").equals("true").withMessage("You must agree to terms"),
];
