// services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP email
const sendOTPEmail = async (email, otp, firstName) => {
  try {
    const result = await resend.emails.send({
      from: 'SkillSwap <onboarding@resend.dev>',
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
    });

    console.log("✅ OTP email sent:", result?.id);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Test API connection
const testEmailConfig = async () => {
  try {
    await resend.emails.send({
      from: 'SkillSwap <onboarding@resend.dev>',
      to: process.env.EMAIL_USERNAME || 'test@example.com',
      subject: 'Resend Connected Successfully ✅',
      text: 'Your backend email service is working!'
    });

    console.log("✅ Resend email service verified");
    return true;
  } catch (err) {
    console.error("❌ Resend configuration error:", err);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  testEmailConfig
};
