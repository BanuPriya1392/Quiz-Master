import mongoose from "mongoose";

// Function to connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;