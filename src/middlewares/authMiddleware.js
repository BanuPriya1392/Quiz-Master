import jwt from "jsonwebtoken";

// MIDDLEWARE 1 — verifyToken
export const verifyToken = (req, res, next) => {
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

    //  JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded user id
    req.user = decoded; // { id, email, role }

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