import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token and attach user info to request
export const verifyToken = async (req, res, next) => {
  try {
    // 1️ Get Authorization header
    const authHeader = req.headers.authorization;
    
    // 2 Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 3️ Extract token
    const token = authHeader.split(" ")[1];

    // 4️ Verify token
    const decoded = jwt.verify(token, "quizmasterworking@2026");

    // 5️ Find user (optimized query)
    const user = await User.findById(decoded.id).select("_id role email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    //  Attach user to request
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

//role-based access control
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


//admin only
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admins can perform this action.",
    });
  }
  next();
};

//mentor only
export const isMentor = (req, res, next) => {
  if (!req.user || req.user.role !== "mentor") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only mentors can perform this action.",
    });
  }
  next();
};