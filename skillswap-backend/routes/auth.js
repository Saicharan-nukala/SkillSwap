// routes/auth.js
const express = require('express');
const { register, verifyOTP, resendOTP, login } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate user account
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user email
// @access  Public
router.post('/resend-otp', resendOTP);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

module.exports = router;