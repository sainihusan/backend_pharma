const SibApiV3Sdk = require("@getbrevo/brevo");

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendOtpEmail = async (
  to,
  otp,
  subject = "Your OTP Code"
) => {

  const sendSmtpEmail =
    new SibApiV3Sdk.SendSmtpEmail();

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

    const response =
      await apiInstance.sendTransacEmail(
        sendSmtpEmail
      );

    console.log("EMAIL SENT SUCCESSFULLY");

    return response;

  } catch (error) {

    console.log("BREVO ERROR:", error);

    throw new Error("Email send failed");
  }
};

module.exports = { sendOtpEmail };