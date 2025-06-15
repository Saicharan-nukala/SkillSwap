// controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
const { sendOTPEmail } = require('../services/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user and send OTP
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists with this email' 
        });
      } else {
        // User exists but email not verified, delete and recreate
        await User.findByIdAndDelete(existingUser._id);
      }
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ 
          success: false,
          message: 'Username already taken' 
        });
      }
    }

    // Generate OTP and expiration
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      username: username ? username.trim() : undefined,
      emailOTP: otp,
      otpExpires,
      isEmailVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for the OTP to verify your account.',
        data: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName
        }
      });
    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      console.error('Email sending failed:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Registration failed. Unable to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check OTP validity
    if (!user.emailOTP || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches
    if (user.emailOTP !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Verify the user
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.otpExpires = null;
    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.emailOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send new OTP email
    try {
      await sendOTPEmail(user.email, otp, user.firstName);
      
      res.status(200).json({
        success: true,
        message: 'New OTP sent successfully! Please check your email.',
        data: {
          userId: user._id,
          email: user.email
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
};

// Login (basic version - you might want to add JWT)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user._id
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Return user data (you might want to add JWT token here)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login
};