import mongoose from "mongoose";

// Schema to store each quiz attempt made by a user
const quizAttemptSchema = new mongoose.Schema(
  {
    // Reference to the user who attempted the quiz
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
    },

    // Array of 10 answer objects — one per question
    // Frontend: answers = Array(10).fill(null) → user picks null | 'A' | 'B' | 'C' | 'D'
    answers: {
      type: [
        {
          // Reference to the question being answered
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
          },

          // The option selected by the user (null if skipped)
          selected: {
            type: String,
            enum: {
              values: ["A", "B", "C", "D"],
              message: "Answer must be one of A, B, C, D.",
            },
            default: null,
          },

          // Whether the selected answer was correct
          // Frontend: compare selected with correct answer → true | false
          isCorrect: {
            type: Boolean,
            default: false,
          },
        },
      ],

      // Exactly 10 answers must be submitted — one per question
      validate: {
        validator: (arr) => arr.length === 10,
        message: "Answers must contain exactly 10 items (one per question).",
      },
    },

    // Total number of correct answers (0 to 10)
    // Frontend: score = answers.reduce((acc, ans) => acc + (ans.isCorrect ? 1 : 0), 0)
    score: {
      type: Number,
      required: [true, "Score is required."],
      min: [0, "Score cannot be negative."],
      max: [10, "Score cannot exceed 10."],
    },

    // Score expressed as a percentage (0 to 100)
    // Frontend: percentage = Math.round((score / 10) * 100)
    percentage: {
      type: Number,
      required: [true, "Percentage is required."],
      min: [0, "Percentage cannot be negative."],
      max: [100, "Percentage cannot exceed 100."],
    },

    // Time the user spent on the quiz, stored in seconds (0 to 600)
    // Max allowed time is 10 minutes = 600 seconds
    // Frontend: timeTaken = 600 - timeLeft
    // Display format: convert to MM:SS (e.g., 525 → "08:45")
    // Validation: if timeTaken > 600 → show error "Time limit exceeded!"
    timeTaken: {
      type: Number,
      required: [true, "Time taken is required."],
      min: [0, "Time taken cannot be negative."],
      max: [600, "Time taken cannot exceed 600 seconds (10 minutes)."],
    },

    // Pass/Fail result based on percentage
    // Frontend: status = percentage >= 70 ? "Passed" : "Failed"
    // Passing threshold is 70% (7 or more correct answers out of 10)
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
    // Automatically adds createdAt and updatedAt timestamp fields
    timestamps: true,

    // Removes the __v version field added by Mongoose by default
    versionKey: false,
  },
);

// Instance Method: Format timeTaken (in seconds) to MM:SS string
quizAttemptSchema.methods.getFormattedTimeTaken = function () {
  const totalSeconds = this.timeTaken;

  // Guard: should never exceed 600 due to schema max, but just in case
  if (totalSeconds > 600) {
    return "Time limit exceeded!";
  }

  const minutes = Math.floor(totalSeconds / 60); // e.g., 525 → 8
  const seconds = totalSeconds % 60; // e.g., 525 → 45

  // Pad single digits with leading zero → "08:45"
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${mm}:${ss}`;
};

//Static Method: Validate timeTaken value 

quizAttemptSchema.statics.isValidTimeTaken = function (timeTaken) {
  return timeTaken >= 0 && timeTaken <= 600;
};

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;
