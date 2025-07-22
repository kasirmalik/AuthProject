import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.json({ success: false, message: "User already exists" });
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
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error in register" });
  }
};

// for login
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.json({ success: false, message: "All fields are required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.json({ success: false, message: "Invalid password" });
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
    res.json({ success: true, message: "Login successful", token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.json({ success: false, message: "Error in login" });
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
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.json({ sucess: false, message: "Error in logout" });
  }
};

// to verify otp

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      res.json({ success: false, message: "User already verified" });
    }

    // gen otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));

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

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error in verify otp" });
  }
};

// verify email

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    res.json({ success: false, message: "All fields are required" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user){
      res.json({ success: false, message: "User not found" });
    }
    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({ success: false, message: "Invalid otp" });
    }
    if (user.verifyOtpExpiryAt < Date.now() ){
      return res.json({ success: false, message: "OTP expired!" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpiryAt = 0;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
     
  } catch (error) {
    res.json({ success: false, message: "Error in verify email" });
  }
};

//isauthenticated 

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    res.json({ sucess: false, message: "Error in isauthenticated" });
  }
};
  

// send password reset otp 

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user){
      res.json({ success: false, message: "User not found"})
    };
    // gen otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.verifyOtpExpiryAt = Date.now() + 1000 * 60 * 15;
    await user.save();
    // send otp to user email

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your Otp is, ${otp}.verify this 6 minutes!`,
    };
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    res.json({ success: false, message: "error in sendResetOtp" });
  }

};

//verify otp and reset password

export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword} = req.body;
      if (!email || !otp || !newPassword) {
        return res.json({ sucess: false, message: "All fields are required"})
      }
      try {
        const user = await userModel.findOne({ email });
        if (!user){
          res.json({ success: false, message: "User not found" });
        };
        if(user.resetOtp === "" || user.resetOtp !== otp ()){
          return res.json({ success: false, message: "Invalid OTP" });
        };
        if(user.resetOtpExpiryAt < Date.now()){
          return res.json({ success: false, message: "OTP Expired"})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password =  hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiryAt = "";
        await user.save();
        return res.json({ success: true, message: "Password reset successfully" });
      } catch (error) {
        res.json({ success: false, message: "error in resetPassword" });
      }
 };
  
