import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
import Question from "../models/QuizQuestions.js";

//common validation result handler
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
// ID VALIDATION
export const validateId = [
  param("id")
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid MongoDB ID"),
  validate,
];

//quiz collection creation validation
export const validateCreateCollection = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 2, max: 100 }).withMessage("Title must be 2-100 characters"),

  body("description")
    .optional()
    .trim()
    .isString().withMessage("Description must be string")
    .isLength({ max: 300 }).withMessage("Max 300 characters"),

  body("category")
    .optional()
    .isString().withMessage("Category must be string"),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"]).withMessage("Difficulty must be easy | medium | hard"),

  validate,
];

//quiz collection update validation

// TITLE
const titleField = body("title")
  .notEmpty()
  .withMessage("Title is required")
  .isLength({ min: 2, max: 100 });

// CATEGORY
const categoryField = body("category")
  .notEmpty()
  .withMessage("Category is required")
  .isString();

// DIFFICULTY
const difficultyField = body("difficulty")
  .optional()
  .isIn(["easy", "medium", "hard"])
  .withMessage("Difficulty must be easy | medium | hard");

// QUIZ ID (IMPORTANT 🔥)
const quizIdField = body("quizId")
  .notEmpty()
  .withMessage("quizId is required")
  .custom((val) => mongoose.Types.ObjectId.isValid(val))
  .withMessage("Invalid quizId");

// QUESTION
const questionField = body("question")
  .notEmpty()
  .withMessage("Question required")
  .isLength({ min: 10 });

// OPTIONS
const optionsField = body("options")
  .isArray({ min: 4, max: 4 })
  .withMessage("Exactly 4 options required")
  .custom((opts) => {
    const valid = ["A", "B", "C", "D"];
    const ids = opts.map((o) => o.id);

    if (new Set(ids).size !== 4) {
      throw new Error("Duplicate option IDs");
    }

    for (let opt of opts) {
      if (!valid.includes(opt.id)) {
        throw new Error("Option id must be A/B/C/D");
      }
      if (!opt.text) {
        throw new Error("Option text required");
      }
    }

    return true;
  });

// CORRECT
const correctField = body("correct")
  .isIn(["A", "B", "C", "D"])
  .withMessage("Correct must be A/B/C/D");

// MATCH CORRECT WITH OPTIONS
const correctMatchesOption = body("correct").custom((correct, { req }) => {
  const ids = req.body.options?.map((o) => o.id) || [];
  if (!ids.includes(correct)) {
    throw new Error("Correct answer must match options");
  }
  return true;
});

// tip
const tipField = body("tip")
  .notEmpty()
  .withMessage("Tip required");

// limit to 10 questions per quiz

export const maxTenQuestionsPerTitle = async (req, res, next) => {
  try {
    const { quizId } = req.body;

    if (!quizId) return next();

    const count = await Question.countDocuments({ quizId });

    if (count >= 10) {
      return res.status(400).json({
        success: false,
        message: "This quiz already has 10 questions",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

//bulk create questions
export const validateBulkCreate = [
  body("quizId")
    .notEmpty()
    .withMessage("quizId is required")
    .isMongoId()
    .withMessage("Invalid quizId"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("Questions must be an array"),

  body("questions.*.question")
    .notEmpty()
    .withMessage("Question required")
    .isLength({ min: 10 })
    .withMessage("Minimum 10 characters"),

  body("questions.*.options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Exactly 4 options required"),

  body("questions.*.options.*.id")
    .isIn(["A", "B", "C", "D"])
    .withMessage("Option id must be A/B/C/D"),

  body("questions.*.options.*.text")
    .notEmpty()
    .withMessage("Option text required"),

  body("questions.*.correct")
    .isIn(["A", "B", "C", "D"])
    .withMessage("Correct must be A/B/C/D"),

  body("questions.*.tip")
    .notEmpty()
    .withMessage("Tip required"),

  validate,
];

//exports
// CREATE QUESTION
export const validateCreate = [
  titleField,
  quizIdField,      
  categoryField,
  difficultyField,
  questionField,
  optionsField,
  correctField,
  correctMatchesOption,
  tipField,
  validate,
];

// UPDATE QUESTION
export const validateUpdate = [
  validateId[0],
  titleField,
  quizIdField,
  categoryField,
  difficultyField,
  questionField,
  optionsField,
  correctField,
  correctMatchesOption,
  tipField,
  validate,
  maxTenQuestionsPerTitle,
  validateBulkCreate
];
