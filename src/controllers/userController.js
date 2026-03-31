import User from "../models/User.js";
import QuizSession from "../models/quizSession.model.js";
import sendResponse from "../utils/sendResponse.js";
import mongoose from "mongoose";


// CREATE USER
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      photo,
      role,
      agreeToTerms
    } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "Name, email, password required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      photo,
      role,
      agreeToTerms
    });

    user.password = undefined;

    return sendResponse(res, 201, true, "User created successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};



// GET PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "Profile fetched", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};



// UPDATE PROFILE  (🔥 IMPORTANT FIX NAME)
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      photo,
      rank,
      xp,
      quizzes,
      score,
      streak
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // ✅ Safe updates
    if (name !== undefined) user.name = name;
     if (email !== undefined) user.email = email; 
    if (photo !== undefined) user.photo = photo;
    if (rank !== undefined) user.rank = rank;
    if (xp !== undefined) user.xp = xp;
    if (quizzes !== undefined) user.quizzes = quizzes;
    if (score !== undefined) user.score = score;
    if (streak !== undefined) user.streak = streak;

    await user.save();

    user.password = undefined;

    return sendResponse(res, 200, true, "Profile updated successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};



// 🔥 USER ANALYTICS (renamed from deleteUser ❗)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalAttempts = await QuizSession.countDocuments({
      user: userId
    });

    const avgScore = await QuizSession.aggregate([
      {
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



// DELETE PROFILE
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "Account deleted successfully");

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};