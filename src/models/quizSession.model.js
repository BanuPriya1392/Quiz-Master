import mongoose from "mongoose";

// ── Quiz Session Schema
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
        ref: "Question",
      },
    ],
    totalQuestions: {
      type: Number,
      default: 10,
    },
    timeLimit: {
      type: Number,
      default: 600000, 
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
      default: Date.now,
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

const QuizSession = mongoose.model("QuizSession", quizSessionSchema);
export default QuizSession;