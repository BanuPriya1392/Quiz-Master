// src/middlewares/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 🔐 VERIFY TOKEN (Authentication)
 */
export const verifyToken = async (req, res, next) => {
  try {
    // 1️⃣ Get Authorization header
    const authHeader = req.headers.authorization;

    // 2️⃣ Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 3️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Find user (optimized query)
    const user = await User.findById(decoded.id).select("_id role email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 6️⃣ Attach user to request
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


/**
 * 🔐 ROLE-BASED ACCESS CONTROL (Flexible)
 */
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};


/**
 * 🔐 ADMIN ONLY
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admins can perform this action.",
    });
  }
  next();
};


/**
 * 🔐 MENTOR ONLY
 */
export const isMentor = (req, res, next) => {
  if (!req.user || req.user.role !== "mentor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only mentors can perform this action.",
    });
  }
  next();
};