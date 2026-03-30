// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// DB
import connectDB from "./src/config/database.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import userQuizRoutes from "./src/routes/userQuizRoutes.js";
import quizSessionRoutes from "./src/routes/quizSession.Routes.js";

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

//auth routes
app.use("/api/auth", authRoutes);

//user routes
app.use("/api/users", userRoutes);

app.use("/api/admin/users", adminUserRoutes);

//admin routes
app.use("/api/admin", adminRoutes);

//admin analytics routes
app.use("/api/admin/analytics", adminAnalyticsRoutes);

//categories routes
app.use("/api/categories", categoryRoutes);

//questions routes
app.use("/api/questions", questionRoutes);

//quizzes routes
app.use("/api/quizzes", quizRoutes);

//attempts routes
app.use("/api/attempts", attemptRoutes);


app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`)
});