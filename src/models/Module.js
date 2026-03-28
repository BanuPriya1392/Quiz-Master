// models/Module.js
import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
       lowercase: true,
    },

    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizCollection",
      required: true,
    },

    order: {
      type: Number,
      default: 0, 
    },

    totalQues: {
      type: Number,
      default: 0,
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

const Module = mongoose.model("Module", moduleSchema);
export default Module;