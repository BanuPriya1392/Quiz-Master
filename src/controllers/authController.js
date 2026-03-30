import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";

// 1. REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, agreeToTerms } = req.body;

    if (password.trim() !== confirmPassword.trim()) {
      return sendResponse(res, 400, false, "Passwords do not match");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      agreeToTerms
    });

    return sendResponse(res, 201, true, "User registered successfully", {
      
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// 2. LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendResponse(res, 400, false, "Invalid email or password");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendResponse(res, 200, true, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// 3. LOGOUT
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    return sendResponse(res, 200, true, "Reset token generated", {
      token: resetToken
    });

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// 4. RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid or expired token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return sendResponse(res, 200, true, "Password reset successful");

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};


// 5. CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return sendResponse(res, 400, false, "Old password incorrect");
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, "Password changed successfully");

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};