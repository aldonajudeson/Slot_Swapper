const User=require("../models/userModel")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")

const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"7d",
    })
}

exports.signup=async(req,res)=>{
    try{
        const{name,email,password}=req.body;
        const existingUser=await User.findOne({email})
        if(existingUser)
            return res.status(400).json({message: "User already exists" })

        const user=await User.create({name,email,password})

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.login=async(req,res)=>{
    try{
        const{email,password}=req.body

        const user=await User.findOne({email})
        if(!user)
            return res.status(400).json({message:"Invalid email or password"})

        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch)
            return res.status(400).json({message:"Invalid email or password"})

        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

exports.getMe=async (req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password")
        res.json(user)
    }catch(error){
        res.status(500).json({message:error.message})
    }
}