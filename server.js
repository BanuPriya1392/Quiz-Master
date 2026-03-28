// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// DB
import connectDB from "./src/config/database.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import userQuizRoutes from "./src/routes/userQuizRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import quizCollectionsRoutes from "./src/routes/quizCollectionsRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import quizTestRoutes from "./src/routes/quizTestRoutes.js";
import moduleRoutes from "./src/routes/moduleRoutes.js";


// ENV
dotenv.config();

const app = express();

// DB connect
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/quiz", userQuizRoutes);

// FIXED HERE
app.use("/api/admin", adminRoutes);

app.use("/api/quiz-collections", quizCollectionsRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizTestRoutes);

app.use("/api/modules", moduleRoutes);

// ─── Test Route ─────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});