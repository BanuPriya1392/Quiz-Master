import mongoose from "mongoose";

// Create schema
const userSchema = new mongoose.Schema(
  {
    // User full name
    name: {
      type: String,
      required: true
    },

    // Email
    email: {
      type: String,
      required: true,
      unique: true
    },

    // Password
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Export model
export default mongoose.model("User", userSchema);