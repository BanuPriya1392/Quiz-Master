// import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import database connection
import connectDB from "./src/config/database.js";

// import routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

import userQuizRoutes from "./src/routes/userQuizRoutes.js";
import quizSessionRoutes from "./src/routes/quizSession.Routes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

import quizCollectionRoutes from "./src/routes/quizCollectionsRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import quizTestRoutes from "./src/routes/quizTestRoutes.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect MongoDB
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

// FIXED HERE
app.use("/api/users", userRoutes);

// app.use("/api/mentor/quiz", quizRoutes);
app.use("/api/users/quiz", userQuizRoutes);
app.use("/api/quiz/session", quizSessionRoutes);
app.use("/api/admin/users", adminRoutes);


// Quiz Collection (Mentor creates quizzes)
app.use("/api/quiz-collection", quizCollectionRoutes);

// Questions (Mentor adds questions)
app.use("/api/questions", questionRoutes);

// Quiz Test (Student side)
app.use("/api/quiz", quizTestRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});