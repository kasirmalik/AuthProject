import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.json({ sucess: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.json({ sucess: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    /// Genrate token for authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

     /// to send email
     const mailOptions = {
       from: process.env.SENDER_EMAIL,
       to: email,
       subject: "Welcome to Auth Project",
       text: `Welcome to Auth Project, ${email}!`,
     };
     await transporter.sendMail(mailOptions)


    res.json({ sucess: true, message: "User registered successfully" });
  } catch (error) {
    res.json({ sucess: false, message: "Error in register" });
  }
};

// for login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({ sucess: false, message: "All fields are required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ sucess: false, message: "User not found" });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.json({ sucess: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.json({ sucess: true, message: "Login successful", token });
  } catch (error) {
    res.json({ sucess: false, message: "Error in login" });
  }
};

// logout

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ sucess: true, message: "Logout successful" });
  } catch (error) {
    res.json({ sucess: false, message: "Error in logout" });
  }
};

// to verify otp

export const sendVerifyOtp = async (req, res) =>{
  try {
    const {userId} = req.body;
    const user = await userModel.findById(userId);
    if (!user){
      res.json({ sucess: false, message: "User not found" });
    }
    
    if(user.isAccountVerified){
      res.json({ sucess: false, message: "User already verified" });
    }

    // gen otp 
    const otp =String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = otp;
    user.verifyOtpExpiryAt = Date.now() + 1000 * 60 * 20;
    await user.save();
    // send otp to user email

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your Otp is, ${otp}.verify this 20 minutes!`,
    };
    await transporter.sendMail(mailOption);

    res.json({ sucess: true, message: "OTP sent successfully" });
    
    

  } catch (error) {
    res.json({ sucess: false, message: "Error in verify otp" });
  }
};

// 


