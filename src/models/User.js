import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },

    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["student", "admin", "mentor"],
      default: "student",
    },

    agreeToTerms: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔐 HASH PASSWORD BEFORE SAVING USER
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔑 METHOD TO COMPARE PASSWORD DURING LOGIN
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
