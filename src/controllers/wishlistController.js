import Wishlist from "../models/Wishlist.js";

// POST
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.body;

    const exists = await Wishlist.findOne({
      user: userId,
      question: questionId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already added",
      });
    }

    const wishlist = await Wishlist.create({
      user: userId,
      question: questionId,
    });

    res.status(201).json({
      success: true,
      data: {
        user: wishlist.user,
        question: wishlist.question,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;

    await Wishlist.findOneAndDelete({
      user: userId,
      question: questionId,
    });

    res.status(200).json({
      success: true,
      message: "Removed",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};