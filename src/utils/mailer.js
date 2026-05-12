const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",

  port: 587,

  secure: false,

  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },

  family: 4,

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

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
      <div>
        <h2>Agent IDE</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>Expires in 10 minutes.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("EMAIL SENT:", info.messageId);
};

module.exports = { sendOtpEmail };
