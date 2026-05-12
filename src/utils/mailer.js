const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),

  secure: false, // use false for port 587

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

/**
 * Sends OTP Email
 */
const sendOtpEmail = async (
  to,
  otp,
  subject = "Your OTP Code"
) => {

  const mailOptions = {
    from: `"Agent IDE" <${process.env.SMTP_USER}>`,
    to,
    subject,

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Agent IDE</h2>

        <p>Your OTP code is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("EMAIL SENT:", info.messageId);
};

module.exports = { sendOtpEmail };
