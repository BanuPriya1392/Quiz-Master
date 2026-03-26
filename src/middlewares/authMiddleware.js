import jwt from "jsonwebtoken";
import User from "../models/User.js"; 

// MIDDLEWARE 1 — verifyToken
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided. Please login first.",
      });
    }

    // "Bearer <token>" - token
    const token = authHeader.split(" ")[1];

    // JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // NEW: Check user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // BLOCK CHECK
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Access denied.",
      });
    }

    // decoded user id
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

/*  MIDDLEWARE 2 — isMentor */
export const isMentor = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only mentors can perform this action.",
    });
  }
  next();
};

/* MIDDLEWARE 3 — isStudent */
export const isStudent = (req, res, next) => {
  if (req.user.role !== "learner") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only students can attend the quiz.",
    });
  }
  next();
};

/* MIDDLEWARE 4 — isAdmin  */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admins can perform this action.",
    });
  }
  next();
};