import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, agreeToTerms } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role,
      agreeToTerms,
    });

    return sendResponse(res, 201, true, "User registered successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      agreeToTerms: user.agreeToTerms,
    });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
