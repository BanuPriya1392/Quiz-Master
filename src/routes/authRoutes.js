const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");
const { validateRegister } = require("../middleware/authMiddleware");

const router = express.Router();


// Register
router.post("/register", validateRegister, registerUser);


// Login
router.post("/login", loginUser);

module.exports = router;