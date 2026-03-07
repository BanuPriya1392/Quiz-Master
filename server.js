const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./src/config/database");
const userRoutes = require("./src/routes/authRoutes");

// Load environment variables FIRST
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Quiz API is running...");
});

// API Routes
app.use("/api/users", userRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});