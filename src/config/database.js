const mongoose = require("mongoose");

const connectDB = async () => {
  try {
   mongoose.connection.on("connected",()=>{
    console.log("MongoDB connected");
   });

   mongoose.connection.on("error",(err)=>{
    console.log("MongoDB error:",err);
   });
   mongoose.connection.on("Disconnected",()=>{
    console.warn("MongoDB disconnected. Reconnecting...");
   });

   await mongoose.connect(process.env.MONGO_URL,{
    autoIndex:false,
    maxPoolSize:10,
    serverSelectionTimeoutMS:5000,
    socketTimeoutMS:45000,
    family:4
   }
    
   )
  } catch (error) {
    console.error("MongoDB intial connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;