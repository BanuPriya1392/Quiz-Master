import User from "../models/User.js";


// 1. Create User (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, agreeToTerms } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 10) {
      return res.status(400).json({ message: "Password must be at least 10 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!agreeToTerms) {
      return res.status(400).json({ message: "Please accept terms" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "learner",
      agreeToTerms
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });

  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



//  2. Get All Users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      list: users,
      total,
      currentPage: Number(page)
    });

  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ✅ 3. Get Single User
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ✅ 4. Update Status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Status updated",
      user
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ✅ 5. Update Role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["learner", "mentor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Role updated",
      user
    });

  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// ✅ 6. Delete User (FIXED ERROR)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};