// services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD // Use app password for Gmail
  }
});

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Email Verification - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hi ${firstName || 'there'},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for registering! Please use the following OTP to verify your email address:
          </p>
          
          <div style="background-color: #f0f8ff; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
            <h2 style="color: #007bff; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">
              ${otp}
            </h2>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
            <strong>This OTP will expire in 10 minutes.</strong>
          </p>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            If you didn't request this verification, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready ✅');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  testEmailConfig
};