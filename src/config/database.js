import mongoose from "mongoose";

// Function to connect MongoDB
const connectDB = async () => {
  try {

    // connect to MongoDB using connection string from .env
    await mongoose.connect(process.env.MONGO_URI);

    // success message
    console.log("MongoDB Connected Successfully");

  } catch (error) {

    // error message if connection fails
    console.log("Database connection error:", error);

    // stop server if DB connection fails
    process.exit(1);
  }
};

// export function to use in server.js
export default connectDB;