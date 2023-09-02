const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Handle email verification
router.get("/emailValidation", async (req, res) => {
  const email = req.query.email;

  // Generate a random OTP for email verification
  const emailOtp = Math.floor(100000 + Math.random() * 900000);

  try {
    // Create a transporter using your SMTP credentials
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configure the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<p>Dear AeroFinder user,</p>
    <p>Thank you for using AeroFinder.</p>
    <p>Your OTP for registration is <b>${emailOtp}</b>. Use this password to validate your email.</p>
    <p>If you think this message was sent in error, please ignore it.</p>
    <p>Thanks,</p>
    <p>The AeroFinder Team</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res
      .status(200)
      .json({ message: "Verification email sent", emailOtp: emailOtp });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

module.exports = router;
