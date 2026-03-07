const express = require("express");
const dotenv = require("dotenv");

const connectDB = require("./src/config/database");
const userRoutes = require("./src/routes/authRoutes");

// Load env variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/users", userRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});