import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";

// read user profile
export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "Profile fetched successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// update user profile

export const updateUserProfile = async (req, res) => {
  try {

    const { name, photo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, photo },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "Profile updated successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// delete user profile
export const deleteUser = async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(res, 200, true, "User deleted successfully");

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};