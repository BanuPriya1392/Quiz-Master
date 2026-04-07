import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  id: { type: String, enum: ["A", "B", "C", "D"], required: true },
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
  {
     
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },

    moduleName: {
      type: String,
      default: null,
    },

    question: {
      type: String,
      required: [true, "Question is required."],
      trim: true,
      minlength: [10, "Question must be at least 10 characters."],
      maxlength: [500, "Question must not exceed 500 characters."],
    },

    options: {
      type: [optionSchema],
      validate: [
        {
          validator: (opts) => opts.length === 4,
          message: "Options must contain exactly 4 items.",
        },
        {
          validator: (opts) => {
            const ids = opts.map((o) => o.id);
            const allPresent = ["A", "B", "C", "D"].every((id) =>
              ids.includes(id)
            );
            const noDuplicates = new Set(ids).size === 4;
            return allPresent && noDuplicates;
          },
          message: "Options must contain exactly one entry each for A, B, C, and D.",
        },
      ],
    },

    correct: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: [true, "Correct answer is required."],
    },

    tip: {
      type: String,
      trim: true,
      default: null, 
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

questionSchema.pre("save", function (next) {
  if (!this.quizId && !this.moduleId) {
    return next(
      new Error("At least one of quizId or moduleId is required.")
    );
  }
  next();
});

const Question = mongoose.model("QuizQuestion", questionSchema);
export default Question;