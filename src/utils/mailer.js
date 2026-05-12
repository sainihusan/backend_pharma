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

  const emailData = {

    sender: {
      name: "Agent IDE",
      email: process.env.SMTP_USER,
    },

    to: [
      {
        email: to,
      },
    ],

    subject,

    htmlContent: `
      <div>
        <h2>Agent IDE</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  };

  try {

    const response =
      await apiInstance.sendTransacEmail(emailData);

    console.log("EMAIL SENT SUCCESSFULLY");

    return response;

  } catch (error) {

    console.log("BREVO ERROR:", error);

    throw new Error("Email send failed");
  }
};

module.exports = { sendOtpEmail };