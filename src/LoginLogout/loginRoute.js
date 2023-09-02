const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { db } = require("../../mongo");

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user with the given email exists
    const user = await db.User.findOne({ email: email });

    if (user) {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Generate a session token
        const sessionToken = crypto.randomBytes(16).toString("hex");

        // Store user data and session token in the session
        req.session.userId = user._id;
        req.session.sessionToken = sessionToken;

        res.json({
          status: "exist",
          user: user,
        });
      } else {
        // Incorrect password
        res.json({ status: "password incorrect" });
      }
    } else {
      // User with the provided email not found
      res.json({ status: "not exist" });
    }
  } catch (e) {
    // Error occurred during login process
    console.error("Error during login:", e);
    res.json({ status: "error" });
  }
});

module.exports = router;
