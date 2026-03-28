import mongoose from "mongoose";

const quizCollectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
     category: {
    type: String,
    default: "General", // optional now
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },


    totalQues: {
      type: Number,
      default: 0,
    },
    status: {
  type: String,
  enum: ["Active", "Inactive"],
  default: "Active"
},

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const QuizCollection = mongoose.model("QuizCollection", quizCollectionSchema);

export default QuizCollection;