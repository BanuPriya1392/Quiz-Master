import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

/* MIDDLEWARE — collect errors → 422 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/* SUBMIT QUIZ VALIDATOR
   Frontend sends:
   answers   = Array(10) → { questionId, selected: null|'A'|'B'|'C'|'D' }
   timeTaken = number (0-600 seconds)
   score, percentage, status → auto-generated in controller */
export const validateSubmitQuiz = [
  // ── answers array
  body("answers")
    .exists()
    .withMessage("Answers are required.")
    .isArray({ min: 10, max: 10 })
    .withMessage("Answers must contain exactly 10 items.")
    .custom((answers) => {
      const VALID_OPTIONS = ["A", "B", "C", "D"];

      answers.forEach((ans, idx) => {
        // Each answer must be an object
        if (typeof ans !== "object" || ans === null || Array.isArray(ans)) {
          throw new Error(`Answer at index ${idx} must be an object.`);
        }

        // questionId must be valid MongoDB ObjectId
        if (
          !ans.questionId ||
          !mongoose.Types.ObjectId.isValid(ans.questionId)
        ) {
          throw new Error(
            `Answer at index ${idx} must have a valid questionId.`,
          );
        }

        // selected: null or A/B/C/D
        // Frontend allows null (unanswered questions)
        if (ans.selected !== null && ans.selected !== undefined) {
          if (!VALID_OPTIONS.includes(ans.selected)) {
            throw new Error(
              `Answer at index ${idx} selected must be null or one of A, B, C, D.`,
            );
          }
        }

        // ✅ isCorrect removed — server auto-calculates it
      });

      return true;
    }),

  // ── timeTaken: Frontend → 600 - timeLeft
  body("timeTaken")
    .exists({ checkNull: true })
    .withMessage("Time taken is required.")
    .isInt({ min: 0, max: 600 })
    .withMessage("Time taken must be between 0 and 600 seconds."),

  // ✅ score, percentage, status, cross-field checks removed — auto-generated in controller

  validate,
];

/* GET MY ATTEMPTS — no body validation needed
   (user id comes from JWT token via verifyToken) */
export const validateGetAttempts = [];
