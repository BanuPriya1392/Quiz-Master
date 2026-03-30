import User from "../models/User.js";
import QuizSession from "../models/quizSession.model.js";

//admin - get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

//get user by id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

//update user
export const updateUser = async (req, res, next) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

//update user role
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

//get user quiz attempts
export const getUserAttempts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const attempts = await QuizSession.find({ user: userId })
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
};