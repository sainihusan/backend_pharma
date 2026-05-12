const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendOtpEmail = async (
  to,
  otp,
  subject = "Your OTP Code"
) => {

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;

  sendSmtpEmail.htmlContent = `
    <div>
      <h2>Agent IDE</h2>

      <p>Your OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP expires in 10 minutes.</p>
    </div>
  `;

  sendSmtpEmail.sender = {
    name: "Agent IDE",
    email: process.env.SMTP_USER,
  };

  sendSmtpEmail.to = [
    {
      email: to,
    },
  ];

  try {

    const response = await apiInstance.sendTransacEmail(
      sendSmtpEmail
    );

    console.log("EMAIL SENT:", response);

  } catch (error) {

    console.log("EMAIL ERROR:", error);

    throw new Error("Email send failed");
  }
};

module.exports = { sendOtpEmail };