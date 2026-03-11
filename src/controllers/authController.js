import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendResponse from "../utils/sendResponse.js";


// REGISTER USER
export const registerUser = async (req, res) => {

  try {

    const { name, email, password ,role} = req.body;

    // Check if user already exists
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
      role
    });

  
    return sendResponse(res, 201, true, "User registered successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
      
    });

  } catch (error) {

    return sendResponse(res, 500, false, error.message);
  }
};



// LOGIN USER
export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid credentials");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendResponse(res, 400, false, "Invalid credentials");
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendResponse(res, 200, true, "Login successful", {
      id: user._id,
      name: user.name,
      email: user.email,
      token
    });

  } catch (error) {

    return sendResponse(res, 500, false, error.message);
  }
};



// GET USER PROFILE (Protected Route)
export const getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    return sendResponse(res, 200, true, "User profile", user);

  } catch (error) {

    return sendResponse(res, 500, false, error.message);
  }
};