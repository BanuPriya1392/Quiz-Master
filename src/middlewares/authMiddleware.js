import jwt from "jsonwebtoken";
import User from "../models/User.js";

//  AUTH MIDDLEWARE
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ROLE MIDDLEWARES
export const isStudent = (req, res, next) => {
  if (req.user.role !== "learner") {
    return res.status(403).json({
      success: false,
      message: "Only students allowed",
    });
  }
  next();
};

export const isMentor = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res.status(403).json({
      success: false,
      message: "Only mentors allowed",
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins allowed",
    });
  }
  next();
};