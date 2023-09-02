const express = require("express");
const router = express.Router();
const twilio = require("twilio");

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = twilio(accountSid, authToken);

// Handle OTP sending
router.post("/mobileV", async (req, res) => {
  // Generate a random OTP
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Get the mobile number from the request body
  const { mobile } = req.body;

  // Compose the OTP message
  const message = `Dear customer, your OTP for registration is *${otp}*. Use this password to validate your login.`;

  try {
    // Send the message using Twilio
    const twilioResponse = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", // Admin's Twilio number
      to: `whatsapp:${mobile}`, // User's number
    });

    if (twilioResponse) {
      // If the message was sent successfully, respond with success and the OTP
      res.json({ State: "Sent", otp: otp });
    } else {
      // If sending failed, respond with an error
      res.status(500).json({ State: "failed" });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ State: "failed" });
  }
});

module.exports = router;
