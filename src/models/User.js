import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:[true,"Full Name is required"],
    trim:true,
    minlength:[3,"Name must be at least 3 characters"]
  },

  email:{
    type:String,
    required:[true,"Email is required"],
    unique:true,
    lowercase:true,
    trim:true,
    match:[/\S+@\S+\.\S+/,"Please enter a valid email"]
  },

  password:{
    type:String,
    required:[true,"Password is required"],
    minlength:[10,"Password must be at least 10 characters"]
  },

  photo:{
    type:String,
    default:"https://i.pravatar.cc/100"
  },

  rank:{
    type:String,
    default:"Beginner"
  },

  xp:{
    type:Number,
    default:0
  },

  quizzes:{
    type:Number,
    default:0
  },

  score:{
    type:Number,
    default:0
  },

  streak:{
    type:Number,
    default:0
  },

  joined:{
    type:String,
    default: () => {
      const date = new Date();
      return date.toLocaleString("default",{month:"short",year:"numeric"});
    }
  },

  role: {
    type: String,
    enum: ["learner", "mentor", "admin"],
    default: "learner"
  },

  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active"
  },

  agreeToTerms:{
    type:Boolean,
    required:true
  }

},
{ timestamps:true }
);



// Hash password
userSchema.pre("save", async function(){
  if(!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Remove confirmPassword before saving
  this.confirmPassword = undefined;


});

// Compare password
userSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password,this.password);
};


const User = mongoose.model("User", userSchema);
export default User;