import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Required only for single quiz
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: function () {
        return !this.isCombined;
      },
      default: null,
    },

    isCombined: {
      type: Boolean,
      default: false,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedOption: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],

    totalQuestions: {
      type: Number,
      default: 10,
    },

    
    score: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    wrongAnswers: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number, // seconds
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//  Check expiry (10 min)
quizSessionSchema.methods.isExpired = function () {
  const now = new Date();
  const diff = (now - this.startedAt) / 1000;
  return diff > 600;
};

//  Format time
quizSessionSchema.methods.getFormattedTime = function () {
  const now = this.completedAt || new Date();
  const diff = Math.floor((now - this.startedAt) / 1000);

  const min = Math.floor(diff / 60);
  const sec = diff % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default mongoose.model("QuizSession", quizSessionSchema);