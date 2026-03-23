import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";


// REGISTER USER
export const registerUser = async (req, res) => {

  try {

    const { name, email, password, confirmPassword, role, agreeToTerms } = req.body;

    // check if passwords match
    if (password.trim() !== confirmPassword.trim()) {
      return sendResponse(res, 400, false, "Passwords do not match");
    }

    // check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    // create user (DO NOT store confirmPassword)
    const user = await User.create({
      name,
      email,
      password,
      role,
      agreeToTerms
    });

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendResponse(res, 201, true, "User registered successfully", {
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



// LOGIN USER
export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid email or password");
    }

    // compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendResponse(res, 400, false, "Invalid email or password");
    }

    // create token
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