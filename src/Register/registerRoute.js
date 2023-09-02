const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../../mongo");

// Route for user registration
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, mobile, password } = req.body;

  // Hash the password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const data = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    mobile: mobile,
    password: hashedPassword,
    mobileVerified: true,
    emailVerified: true,
  };

  try {
    // Create a new user document in the database
    const registeredData = await db.User.create(data);
    res.json({ status: "registered", user: registeredData });
  } catch (e) {
    // Handle errors during registration
    res.json({ status: "error" });
  }
});

// Route to check if an email address exists
router.get("/emailChecker", async (req, res) => {
  const email = req.query.email;
  try {
    // Check if the email exists in the database
    const check = await db.User.findOne({ email: email });

    if (check) {
      res.json({ status: "exist" });
    } else {
      res.json({ status: "Not exist" });
    }
  } catch (e) {
    // Handle errors during email existence checking
    res.json({ status: "error" });
  }
});

module.exports = router;
