import mongoose from "mongoose";

// ── Option sub-schema
const optionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: [true, "Option id is required."],
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Option text is required."],
      maxlength: [200, "Option text must not exceed 200 characters."],
    },
  },
  { _id: false }
);

// ── Question schema
const questionSchema = new mongoose.Schema(
  {
    // ── NEW: Quiz Title (e.g. "JavaScript", "HTML", "CSS")
    title: {
      type: String,
      required: [true, "Quiz title is required."],
      trim: true,
      minlength: [2,   "Title must be at least 2 characters."],
      maxlength: [100, "Title must not exceed 100 characters."],
    },

    question: {
      type: String,
      required: [true, "Question is required."],
      trim: true,
      minlength: [10,  "Question must be at least 10 characters."],
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
          message:
            "Options must contain exactly one entry each for A, B, C, and D.",
        },
      ],
    },

    correct: {
      type: String,
      required: [true, "Correct answer is required."],
      enum: {
        values: ["A", "B", "C", "D"],
        message: "Correct must be one of A, B, C, D.",
      },
    },

    tip: {
      type: String,
      required: [true, "Tip/explanation is required."],
      trim: true,
      minlength: [10,  "Tip must be at least 10 characters."],
      maxlength: [500, "Tip must not exceed 500 characters."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Cross-field: 'correct' must be one of the supplied option ids
questionSchema.pre("validate", async function () {
  if (this.options && this.correct) {
    const ids = this.options.map((o) => o.id);
    if (!ids.includes(this.correct)) {
      this.invalidate(
        "correct",
        `Correct answer "${this.correct}" does not match any of the provided option ids.`
      );
    }
  }
});

const Question = mongoose.model("Question", questionSchema);
export default Question;