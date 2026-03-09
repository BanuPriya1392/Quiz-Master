const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utilities/sendResponse");
require("dotenv").config();


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
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

  

    // Send response
  sendResponse(res, 201, {
    success: true,
    message: "User registered successfully.",
    data: {
      user: {
          id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
       
      },
    },
  });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



// LOGIN USER
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

      // Send response
 sendResponse(res, 200, {
  success: true,
  message: "Login successful.",
  data: {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
  },
});

  } catch (error) {
   sendResponse(res, 500, {
  success: false,
  message: "Server Error",
  data: { error: error.message }
});
  }
};


// EXPORT CONTROLLERS
module.exports = { registerUser, loginUser };