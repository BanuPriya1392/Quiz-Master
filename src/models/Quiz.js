import mongoose from "mongoose";

//Option Schema
const optionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false }
);

// Main Question Schema
const questionSchema = new mongoose.Schema(
  {
    // NEW: Quiz Collection Reference (IMPORTANT)
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizCollection",
      required: true,
      index: true,
    },

    //  NEW: Category (for filtering + analytics)
    category: {
      type: String,
      required: true,
      enum: [
        "Technology",
        "Science",
        "Math",
        "Programming",
        "AI",
        "General",
      ],
      index: true,
    },

    //  NEW: Difficulty Level
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },

    // Question
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },

    // Options
    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length === 4,
        message: "Exactly 4 options required",
      },
    },

    // Correct Answer
    correct: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    // Explanation
    tip: {
      type: String,
      required: true,
      trim: true,
    },

    // Analytics Support
    attempts: {
      type: Number,
      default: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
    },

    // Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Status (Admin control)
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance (VERY IMPORTANT for 300+ questions)
questionSchema.index({ quizId: 1, difficulty: 1 });
questionSchema.index({ category: 1, status: 1 });

// Validate correct answer exists in options
questionSchema.pre("validate", function () {
  const ids = this.options.map((o) => o.id);
  if (!ids.includes(this.correct)) {
    return next(
      new Error("Correct answer must match one of the options")
    );
  }
 
});

const Question = mongoose.model("Question", questionSchema);
export default Question;