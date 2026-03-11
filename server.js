// import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// import database connection
import connectDB from "./src/config/database.js";

// import routes
import authRoutes from "./src/routes/authRoutes.js";

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json()); // middleware to read JSON request body
app.use(cors()); // allow frontend (React / other apps) to access backend

// Connect MongoDB database
connectDB();

// Routes
app.use("/api/auth", authRoutes); 
// All authentication routes will start with /api/auth

// Test route to check if API is running
app.get("/", (req, res) => {
  res.send("Authentication API Running");
});

// Port from environment variable or default 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});