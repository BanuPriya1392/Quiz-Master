// controllers/wishlistController.js
import Wishlist from "../models/Wishlist.js";

//  Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId, categoryId } = req.body;

    if (!questionId && !categoryId) {
      return res.status(400).json({
        success: false,
        message: "questionId or categoryId required",
      });
    }

    const exists = await Wishlist.findOne({
      user: userId,
      ...(questionId && { question: questionId }),
      ...(categoryId && { category: categoryId }),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: userId,
      question: questionId || null,
      category: categoryId || null,
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.find({ user: userId })
      .populate("question", "question")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      data: wishlist.map((w) => ({
        id: w._id,
        question: w.question?.question || null,
        category: w.category?.name || null,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Wishlist.findOneAndDelete({
      _id: id,
      user: userId,
    });

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
