import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },

    // Frontend: answers = Array(10).fill(null) → null|'A'|'B'|'C'|'D'
    answers: {
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
          },
          selected: {
            type: String,
            enum: {
              values: ["A", "B", "C", "D"],
              message: "Answer must be one of A, B, C, D.",
            },
            default: null,
          },
          isCorrect: {
            type: Boolean,
            default: false,
          },
        },
      ],
      validate: {
        validator: (arr) => arr.length === 10,
        message: "Answers must contain exactly 10 items (one per question).",
      },
    },

    // Frontend: score = answers.reduce(...)
    score: {
      type: Number,
      required: [true, "Score is required."],
      min: [0, "Score cannot be negative."],
      max: [10, "Score cannot exceed 10."],
    },

    // Frontend: percentage = Math.round((score / 10) * 100)
    percentage: {
      type: Number,
      required: [true, "Percentage is required."],
      min: [0, "Percentage cannot be negative."],
      max: [100, "Percentage cannot exceed 100."],
    },

    // Frontend: timeTaken = 600 - timeLeft
    timeTaken: {
      type: Number,
      required: [true, "Time taken is required."],
      min: [0, "Time taken cannot be negative."],
      max: [600, "Time taken cannot exceed 600 seconds."],
    },

    // Frontend: percentage >= 70 ? "Passed" : "Failed"
    status: {
      type: String,
      enum: {
        values: ["Passed", "Failed"],
        message: 'Status must be either "Passed" or "Failed".',
      },
      required: [true, "Status is required."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;
