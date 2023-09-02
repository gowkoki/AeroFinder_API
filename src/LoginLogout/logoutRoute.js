const express = require("express");
const router = express.Router();
const cors = require("cors");

// Define a route for handling logout
router.post("/logout", cors(), (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy();
  // Clear the session cookie to ensure the user is logged out
  res.clearCookie("sessionToken");
  // Respond with a success status
  res.json({ status: "success" });
});

module.exports = router;
