import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";


// ✅ CREATE USER (POST)
export const createUser = async (req, res) => {
  try {

    const { name, email, password, agreeToTerms } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, "User already exists");
    }

    // create new user
    const user = await User.create({
      name,
      email,
      password,
      agreeToTerms
    });

    // remove password from response
    user.password = undefined;

    return sendResponse(res, 201, true, "User created successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// ✅ GET PROFILE
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


// ✅ UPDATE PROFILE (SAFE WAY)
export const updateUserProfile = async (req, res) => {
  try {

    const { name, photo } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    if (name) user.name = name;
    if (photo) user.photo = photo;

    await user.save(); // ✅ triggers middleware

    return sendResponse(res, 200, true, "Profile updated successfully", user);

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// ✅ DELETE USER
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