import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";
<<<<<<< HEAD
=======
import Question from "../models/QuizQuestions.js";
import QuizCollection from "../models/QuizCollection.js";
>>>>>>> 3ca751d183848a8965dc6b58c5598c071032891a

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

<<<<<<< HEAD
    if (new Set(ids).size !== 4) {
      throw new Error("Duplicate option IDs");
    }
=======
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
// export const maxTenQuestionsPerTitle = async (req, res, next) => {
//   try {
//     const { title } = req.body;
//     if (!title) return next(); // title validation catches this

//     const count = await Question.countDocuments({
//       title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, // case-insensitive
//     });

//     if (count >= 10) {
//       return res.status(400).json({
//         success: false,
//         message: `"${title}" quiz already has 10 questions. Delete one before adding a new question.`,
//       });
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

export const maxTenQuestionsPerTitle = async (req, res, next) => {
  try {
    const { collectionId } = req.body;

    if (!collectionId) return next();

    const count = await Question.countDocuments({ collectionId });

    if (count >= 10) {
      return res.status(400).json({
        success: false,
        message: "This quiz already has 10 questions. Delete one before adding a new question.",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};
>>>>>>> 3ca751d183848a8965dc6b58c5598c071032891a

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
<<<<<<< HEAD
  quizIdField,
  categoryField,
  difficultyField,
=======
  titleField,         
  maxTenQuestionsPerTitle, 
>>>>>>> 3ca751d183848a8965dc6b58c5598c071032891a
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

<<<<<<< HEAD



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
=======
/* ─────────────────────────────────────────────
   BULK CREATE VALIDATOR
───────────────────────────────────────────── */
export const validateBulkCreate = [
  body("questions")
    .exists()
    .withMessage("Questions array is required.")
    .isArray({ min: 1 })
    .withMessage("Questions must be a non-empty array."),

  body("questions.*.title")
    .exists({ checkFalsy: true })
    .withMessage("Title is required."),

  body("questions.*.question")
    .exists({ checkFalsy: true })
    .withMessage("Question is required."),

  body("questions.*.options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Each question must have exactly 4 options."),

  body("questions.*.correct")
    .isIn(["A", "B", "C", "D"])
    .withMessage("Correct must be one of A, B, C, D."),

  body("questions.*.tip")
    .exists({ checkFalsy: true })
    .withMessage("Tip is required."),
>>>>>>> 3ca751d183848a8965dc6b58c5598c071032891a

  validate,
];

<<<<<<< HEAD

export const validateId = [idParam, validate];
=======
/* ─────────────────────────────────────────────
   COLLECTION VALIDATION
───────────────────────────────────────────── */

// title for collection
const collectionTitleField = body("title")
  .exists({ checkFalsy: true })
  .withMessage("Collection title is required.")
  .trim()
  .isString()
  .withMessage("Title must be a character.")
  .isLength({ min: 3, max: 100 })
  .withMessage("Title must be between 3 and 100 characters.");

// description
const descriptionField = body("description")
  .exists({ checkFalsy: true })
  .withMessage("Description is required.")
  .trim()
  .isString()
  .withMessage("Description must be a charater.")
  .isLength({ min: 10, max: 500 })
  .withMessage("Description must be between 10 and 500 characters.");


  const uniqueCollectionTitle = body("title").custom(async (title) => {
  const existing = await QuizCollection.findOne({
    title: { $regex: new RegExp(`^${title.trim()}$`, "i") }, 
  });

  if (existing) {
    throw new Error("Collection title already exists.");
  }

  return true;
});
/* ── Create Collection Validator */
export const validateCreateCollection = [
  collectionTitleField,
  uniqueCollectionTitle,
  descriptionField,
  validate,
];
>>>>>>> 3ca751d183848a8965dc6b58c5598c071032891a
