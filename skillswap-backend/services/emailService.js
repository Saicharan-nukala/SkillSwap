// services/emailService.js
const sgMail = require('@sendgrid/mail');

// Load API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send OTP Email to user
const sendOTPEmail = async (email, otp, firstName) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_USERNAME,  // Single sender verified email
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
        </div>
      </div>
    `
  };

  try {
    const result = await sgMail.send(msg);
    console.log("✅ OTP email sent to:", email);
    return result;
  } catch (error) {
    console.error("❌ OTP email error:", error.response?.body || error);
    throw error;
  }
};

// Test SendGrid setup when server starts
const testEmailConfig = async () => {
  try {
    await sgMail.send({
      to: process.env.EMAIL_USERNAME,
      from: process.env.EMAIL_USERNAME,
      subject: 'SendGrid Connected ✅',
      text: 'Your backend email service is working!'
    });
    console.log("✅ SendGrid email service verified");
  } catch (err) {
    console.error("❌ SendGrid test error:", err.response?.body || err);
  }
};

module.exports = {
  sendOTPEmail,
  testEmailConfig
};
