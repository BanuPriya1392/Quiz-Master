// Import required packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import database connection
import connectDB from "./src/config/database.js";

// Import routes
import authRoutes from "./src/routes/authRoutes.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json()); // to read JSON data
app.use(cors()); // allow frontend connection

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

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