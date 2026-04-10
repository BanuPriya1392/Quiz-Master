// models/Wishlist.js
import mongoose from "mongoose";
// Wishlist.js
import "./Category.js";
import "./Questions.js";

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
  { timestamps: true },
);

// Prevent duplicate entries
wishlistSchema.index(
  { user: 1, question: 1 },
  {
    unique: true,
    partialFilterExpression: { question: { $type: "objectId" } },
  },
);

wishlistSchema.index(
  { user: 1, category: 1 },
  {
    unique: true,
    partialFilterExpression: { category: { $type: "objectId" } },
  },
);

export default mongoose.model("Wishlist", wishlistSchema);
