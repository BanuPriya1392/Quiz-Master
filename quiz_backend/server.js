const express=require("express");
const app=express();
require("dotenv").config();
const userRoutes = require("./src/routes/authRoutes");
const connectDB = require("./src/config/database");

app.use(express.json());

connectDB();
app.use("/api/users",userRoutes);
app.listen(process.env.PORT,()=>{
    console.log("Server started on port",process.env.PORT);
});