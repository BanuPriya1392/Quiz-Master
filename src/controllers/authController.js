const User=require("../models/User");
const bcrypt= require("bcryptjs");

// register controller
const registerUser=async (req,res)=>{
    try{
        const{name,email,password,role}=req.body;
          // Check existing user
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
         };
         // Hash password
         const salt=await bcrypt.genSalt(10);
         const hashedPassword=await bcrypt.hash(password,salt);
          // Create user
         const user=await User.create({
            name,
            email,
            password:hashedPassword,
            role
         });
         res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
         })
    }catch(error){
        res.status(500).json({
            success:false,
        message:"Server Error",
        error:error.message
        })
    } 
}
module.exports={registerUser};