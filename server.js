// import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import database connection
import connectDB from "./src/config/database.js";

// import routes
import authRoutes from "./src/routes/authRoutes.js";

// Quiz Routes
import quizRoutes from "./src/routes/quizRoutes.js";

//Import user quiz routes
import userQuizRoutes from "./src/routes/userQuizRoutes.js";
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json()); // Read JSON body

// CORS configuration (important for React frontend)
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend URL
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);

// Quiz route
app.use("/api/mentor/quiz", quizRoutes);

app.use("/api/user/quiz", userQuizRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("Authentication API Running");
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
