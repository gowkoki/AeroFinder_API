const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../../mongo");

// Update user profile
router.put("/myAccount/profile", async (req, res) => {
  const { firstName, lastName, email, mobile, user_id } = req.body;

  try {
    const result = await db.User.updateOne(
      { _id: user_id },
      {
        $set: {
          firstName,
          lastName,
          email,
          mobile,
        },
      }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "success" });
    } else {
      res.status(404).json({ message: "error" });
    }
  } catch (error) {
    console.error("Error in updating User data", error);
    res.status(500).json({ message: "Error in updating user data" });
  }
});

// Update user password
router.put("/myAccount/password", async (req, res) => {
  const { newPassword, currentPassword, user_id } = req.body;

  try {
    // Find user by ID
    const user = await db.User.findOne({ _id: user_id });
    if (user) {
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (passwordMatch) {
        // Hash the new password
        const saltRounds = 10;
        const password = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        const result = await db.User.updateOne(
          { _id: user_id },
          {
            $set: {
              password,
            },
          }
        );

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "success" });
        } else {
          res.status(404).json({ message: "error" });
        }
      } else {
        // Incorrect current password
        console.log("incorrect password");
        res.json({ message: "incorrect" });
      }
    } else {
      //user not found
      res.status(404).json({ message: "error" });
    }
  } catch (error) {
    console.error("Error in updating User data", error);
    res.status(500).json({ message: "Error in updating user data" });
  }
});

// Delete user account
router.delete("/myAccount/deleteAccount", async (req, res) => {
  const { user_id } = req.body;

  try {
    // Find user by ID
    const user = await db.User.findOne({ _id: user_id });

    if (user) {
      // Delete the user account
      const result = await db.User.deleteOne({ _id: user_id });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "success" });
      } else {
        res.status(404).json({ message: "error" });
      }
    } else {
      // User not found
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error("Error in deleting user account", error);
    res.status(500).json({ message: "Error in deleting user account" });
  }
});

module.exports = router;
