import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// DB
import connectDB from "./src/config/database.js";

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";

// ADD ALL MISSING IMPORTS
import adminUserRoutes from "./src/routes/adminUserRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import adminAnalyticsRoutes from "./src/routes/adminAnalyticsRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import questionRoutes from "./src/routes/questionRoutes.js";
import attemptRoutes from "./src/routes/attemptRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";

// ENV
dotenv.config();

const app = express();

// DB connect
connectDB();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://quizmastery-flame.vercel.app",
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes); // Routes : Category + Modules
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);


app.use("/api/users", userRoutes);

//Admin routes
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// Core routes
// Categories (with nested module routes inside categoryRoutes.js)
app.use("/api/attempts", attemptRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Health check
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
