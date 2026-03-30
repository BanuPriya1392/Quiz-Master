import User from "../models/User.js";
import QuizSession from "../models/quizSession.model.js";
import sendResponse from "../utils/sendResponse.js";
import mongoose from "mongoose"; // IMPORTANT

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    return sendResponse(res, 200, true, "Profile fetched", user);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");

    return sendResponse(res, 200, true, "Profile updated", user);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ PROFILE STATS (FIXED HERE 🔥)
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ CHANGE: userId → user
    const totalAttempts = await QuizSession.countDocuments({
      user: userId
    });

    const avgScore = await QuizSession.aggregate([
      {
        // ✅ CHANGE: userId → user + ObjectId
        $match: { user: new mongoose.Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$score" }
        }
      }
    ]);

    return sendResponse(res, 200, true, "Stats fetched", {
      totalAttempts,
      averageScore: avgScore[0]?.avg || 0
    });

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// ✅ DELETE PROFILE
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    return sendResponse(res, 200, true, "Account deleted successfully");
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};