const express = require("express");
const {registerUser}= require("../controllers/authController");
const {validateRegister}=require("../middleware/authMiddleware");
const router=express.Router();

// Register Route
router.post("/register",validateRegister,registerUser);

module.exports= router;