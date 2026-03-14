import { body, param, query, validationResult } from "express-validator";
import mongoose from "mongoose";
import Question from "../models/Quiz.js";

/* ── collect errors → 422 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/* ── MongoDB ObjectId param */
const idParam = param("id")
  .custom((val) => mongoose.Types.ObjectId.isValid(val))
  .withMessage("ID must be a valid MongoDB ObjectId.");

/* ─────────────────────────────────────────────
   FIELD — title  ← NEW
   e.g. "JavaScript", "HTML", "CSS", "React"
───────────────────────────────────────────── */
const titleField = body("title")
  .exists({ checkFalsy: true })
  .withMessage("Quiz title is required.")
  .trim()
  .isString()
  .withMessage("Title must be a string.")
  .isLength({ min: 2, max: 100 })
  .withMessage("Title must be between 2 and 100 characters.");

/* ── question field */
const questionField = body("question")
  .exists({ checkFalsy: true })
  .withMessage("Question is required.")
  .trim()
  .isString()
  .withMessage("Question must be a string.")
  .isLength({ min: 10, max: 500 })
  .withMessage("Question must be between 10 and 500 characters.");

/* ── options field */
const optionsField = [
  body("options")
    .exists()
    .withMessage("Options are required.")
    .isArray({ min: 4, max: 4 })
    .withMessage("Options must be an array of exactly 4 items.")
    .custom((opts) => {
      const VALID_IDS = ["A", "B", "C", "D"];
      const seen = new Set();

      for (const opt of opts) {
        if (typeof opt !== "object" || opt === null || Array.isArray(opt))
          throw new Error("Each option must be a plain object { id, text }.");
        if (!VALID_IDS.includes(opt.id))
          throw new Error(`Option id must be one of A, B, C, D. Received: "${opt.id}".`);
        if (seen.has(opt.id))
          throw new Error(`Duplicate option id "${opt.id}" found.`);
        seen.add(opt.id);
        if (typeof opt.text !== "string" || opt.text.trim().length === 0)
          throw new Error(`Option "${opt.id}" must have a non-empty text string.`);
        if (opt.text.trim().length > 200)
          throw new Error(`Option "${opt.id}" text must not exceed 200 characters.`);
      }

      const missing = VALID_IDS.filter((id) => !seen.has(id));
      if (missing.length)
        throw new Error(`Missing option id(s): ${missing.join(", ")}.`);

      return true;
    }),
];

/* ── correct field */
const correctField = body("correct")
  .exists({ checkFalsy: true })
  .withMessage("Correct answer is required.")
  .isIn(["A", "B", "C", "D"])
  .withMessage("Correct must be one of: A, B, C, D.");

/* ── cross-field: correct must match one of the option ids */
const correctMatchesOption = body("correct").custom((correct, { req }) => {
  const opts = req.body.options;
  if (!Array.isArray(opts)) return true;
  const ids = opts.map((o) => o && o.id);
  if (!ids.includes(correct))
    throw new Error(
      `Correct answer "${correct}" must match one of the provided option ids.`
    );
  return true;
});

/* ── tip field */
const tipField = body("tip")
  .exists({ checkFalsy: true })
  .withMessage("Tip is required.")
  .trim()
  .isString()
  .withMessage("Tip must be a string.")
  .isLength({ min: 10, max: 500 })
  .withMessage("Tip must be between 10 and 500 characters.");

/* ── business rule: max 10 questions PER TITLE ← UPDATED */
export const maxTenQuestionsPerTitle = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return next(); // title validation catches this

    const count = await Question.countDocuments({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, // case-insensitive
    });

    if (count >= 10) {
      return res.status(400).json({
        success: false,
        message: `"${title}" quiz already has 10 questions. Delete one before adding a new question.`,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────
   QUERY VALIDATOR — GET /api/mentor/quiz?title=JavaScript
   title filter 
───────────────────────────────────────────── */
export const validateTitleQuery = [
  query("title")
    .optional()
    .trim()
    .isString()
    .withMessage("Title query must be a string.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title query must be between 2 and 100 characters."),
  validate,
];

/* ── exported validator sets */

// POST — title field 
export const validateCreate = [
  titleField,           // ← NEW
  maxTenQuestionsPerTitle, // ← per title check
  questionField,
  ...optionsField,
  correctField,
  correctMatchesOption,
  tipField,
  validate,
];

// GET /:id | DELETE /:id
export const validateId = [idParam, validate];

// PUT /:id — title field include
export const validateUpdate = [
  idParam,
  titleField,        
  questionField,
  ...optionsField,
  correctField,
  correctMatchesOption,
  tipField,
  validate,
];