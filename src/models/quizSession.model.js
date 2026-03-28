import mongoose from "mongoose";

//  Quiz Session Schema
const quizSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizQuestion", // FIX: match your actual model name
      },
    ],
answers: [
  {
    questionId: String,
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
  },
],
    totalQuestions: {
      type: Number,
      default: 10,
    },

    timeLimit: {
      type: String,
      default: "10 Min:00 Sec",
    },

    score: {
      type: Number,
      default: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: Date.now, // ✅ correct
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================================
   ✅ ADD HELPER METHODS (IMPORTANT)
================================ */

// Check if session expired (10 minutes)
quizSessionSchema.methods.isExpired = function () {
  const now = new Date();
  const diff = (now - this.startedAt) / 1000; // seconds
  return diff > 600; // 10 min
};

// Get formatted time
quizSessionSchema.methods.getFormattedTime = function () {
  const now = this.completedAt || new Date();
  const diff = Math.floor((now - this.startedAt) / 1000);

  const min = Math.floor(diff / 60);
  const sec = diff % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const QuizSession = mongoose.model("QuizSession", quizSessionSchema);

export default QuizSession;