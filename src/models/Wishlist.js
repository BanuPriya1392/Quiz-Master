// models/Wishlist.js
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries
wishlistSchema.index({ user: 1, question: 1 }, { unique: true, sparse: true });
wishlistSchema.index({ user: 1, category: 1 }, { unique: true, sparse: true });

export default mongoose.model("Wishlist", wishlistSchema);