// server.js

// ─── Import required packages ─────────────────────────
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ─── Import database connection ──────────────────────
import connectDB from "./src/config/database.js";

// ─── Import routes ───────────────────────────────────
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import userQuizRoutes from "./src/routes/userQuizRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import quizCollectionsRoutes from "./src/routes/quizCollectionsRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js"; // fixed for default export
import quizTestRoutes from "./src/routes/quizTestRoutes.js";

// ─── Load environment variables ──────────────────────
dotenv.config();

// ─── Initialize express app ─────────────────────────
const app = express();

// ─── Connect to MongoDB ─────────────────────────────
connectDB();

// ─── Middleware ─────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ─── API Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/quiz", userQuizRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/quiz-collections", quizCollectionsRoutes);

// Questions (Mentor adds questions)
app.use("/api/questions", questionRoutes);

// Quiz Test (Student side)
app.use("/api/quiz", quizTestRoutes);

// ─── Test Route ─────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

// ─── Error Handler Middleware ───────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ─── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});