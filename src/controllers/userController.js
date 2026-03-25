import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";


//  CREATE USER
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      photo,
      rank,
      xp,
      quizzes,
      score,
      streak,
      role,
      agreeToTerms
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      photo,
      rank,
      xp,
      quizzes,
      score,
      streak,
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

    return sendResponse(res, 200, true, "Profile fetched successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// UPDATE PROFILE
export const updateUserProfile = async (req, res) => {
  try {

    const {
      name,
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

    if (name !== undefined) user.name = name;
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


// DELETE USER
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