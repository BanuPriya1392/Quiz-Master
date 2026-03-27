import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";

/* ── COMMON VALIDATION HANDLER */
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

/* ── OBJECT ID */
const idParam = param("id")
  .custom((val) => mongoose.Types.ObjectId.isValid(val))
  .withMessage("Invalid ID");

/* ───────── QUIZ ID (NEW - IMPORTANT) */
const quizIdField = body("quizId")
  .notEmpty()
  .withMessage("quizId is required")
  .custom((val) => mongoose.Types.ObjectId.isValid(val))
  .withMessage("Invalid quizId");

/* ───────── CATEGORY */
const categoryField = body("category")
  .notEmpty()
  .withMessage("Category is required")
  .isString();

/* ───────── DIFFICULTY */
const difficultyField = body("difficulty")
  .optional()
  .isIn(["easy", "medium", "hard"]);

/* ───────── QUESTION */
const questionField = body("question")
  .notEmpty()
  .withMessage("Question required")
  .isLength({ min: 10 });

/* ───────── OPTIONS */
const optionsField = body("options")
  .isArray({ min: 4, max: 4 })
  .withMessage("Exactly 4 options required")
  .custom((opts) => {
    if (!opts) return true;

    const ids = opts.map((o) => o.id);
    const valid = ["A", "B", "C", "D"];

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

/* ───────── CORRECT */
const correctField = body("correct")
  .isIn(["A", "B", "C", "D"])
  .withMessage("Correct must be A/B/C/D");

/* ───────── TIP */
const tipField = body("tip")
  .notEmpty()
  .withMessage("Tip required");




export const validateCreate = [
  quizIdField,
  categoryField,
  difficultyField,
  questionField,
  optionsField,
  correctField,
  tipField,
  validate,
];




export const validateUpdate = [
  idParam,
  quizIdField,
  categoryField,
  difficultyField,
  questionField,
  optionsField,
  correctField,
  tipField,
  validate,
];




export const validateBulk = [
  quizIdField,
  categoryField,
  difficultyField,

  body("questions")
    .isArray({ min: 1 })
    .withMessage("Questions array required"),

  body("questions.*.question")
    .notEmpty()
    .withMessage("Question required"),

  body("questions.*.options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Exactly 4 options required"),

  body("questions.*.correct")
    .isIn(["A", "B", "C", "D"])
    .withMessage("Correct must be A/B/C/D"),

  body("questions.*.tip")
    .notEmpty()
    .withMessage("Tip required"),

  validate,
];


export const validateId = [idParam, validate];