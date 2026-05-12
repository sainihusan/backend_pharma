const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an OTP email to the specified address.
 * @param {string} to - Recipient email address.
 * @param {string} otp - The 6-digit OTP code.
 * @param {string} subject - Email subject line.
 * @returns {Promise<void>}
 */
const sendOtpEmail = async (to, otp, subject = "Your OTP Code") => {
  const mailOptions = {
    from: `"Agent IDE" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">Agent IDE</h2>
        <p style="color: #4a4a68; font-size: 15px;">Use the code below to complete your request. This code expires in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #1a1a2e; background: #e8e8f0; padding: 12px 28px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // Ethereal preview URL — lets you view the email in the browser
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Preview email: ${previewUrl}`);
  }
};

module.exports = { sendOtpEmail };
