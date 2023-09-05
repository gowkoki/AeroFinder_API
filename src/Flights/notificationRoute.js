const express = require("express");
const router = express.Router();
const axios = require("axios");
const twilio = require("twilio");
const { db } = require("../../mongo");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = twilio(accountSid, authToken);

// Route for notifying flight data to the user
router.post("/notify", async (req, res) => {
  try {
    // Extract data from the request
    const { message, mapLink, mobile, email, flightNumber, flightData } =
      req.body;

    // Check if the mobile & email field matches the provided mobile & email value
    const mobileChecker = await db.Notification.findOne({
      $and: [{ mobile: mobile }, { email: email }],
    });

    if (!mobileChecker || mobileChecker.flightNumber.length < 1) {
      // Create a new notification if mobile & email not found
      await db.Notification.create({
        mobile: mobile,
        email: email,
        flightNumber: [flightNumber],
      });

      //send the intitial notification message and map link
      const twilioResponse1 = await sendNotification(message, mobile, email);

      if (mapLink !== "") {
        // Encode the URL components
        const encodedURL = encodeURIComponent(mapLink);
        const twilioResponse2 = await sendNotification(
          encodedURL,
          mobile,
          email
        );
        if (twilioResponse2) {
          console.log("maplink has been sent successfully");
        } else {
          console.log("Failed to sent maplink");
        }
      }

      // Temporarily store the flight data in the DB
      const existingFlightData = await db.FlightData.findOne({ flightNumber });
      if (existingFlightData) {
        // Flight number already exists in the database, do not save flight data again
        console.log(
          `Flight number ${flightNumber} already exists in the database.`
        );
      } else {
        // Flight number does not exist in the database, save the flight data
        await db.FlightData.create(flightData);
        console.log(
          `Flight data saved successfully for flight number ${flightNumber}.`
        );
      }

      // Scheduled job using node-cron
      const scheduledJob = cron.schedule("*/3 * * * *", async () => {
        try {
          // Fetch flight data
          const flightData = await fetchFlightData(flightNumber);
          // Fetch the flight data from the DB
          const savedFlightData = await db.FlightData.findOne({ flightNumber });
          //compare the API response's flight data with savedFlightData in the database
          if (savedFlightData) {
            const notifications = await updateFlightData(
              savedFlightData,
              flightData,
              flightNumber
            );

            //send the notification message,email and mobile number to the sendNotification function
            if (notifications.length > 0) {
              for (const notification of notifications) {
                await sendNotification(notification.message, mobile, email);
              }
            }

            // If flight status is arrived
            if (flightData[0].status === "Arrived") {
              // stop the cron job
              scheduledJob.stop();
              // final notification
              const finalMsg =
                "Flight has Landed, Thank you! for using AeroFinder";
              await sendNotification(finalMsg, mobile, email);
              // Delete the flight data and notification from the database
              await db.FlightData.deleteOne({ flightNumber });
              await db.Notification.deleteOne({ mobile });
              console.log(
                "Flight has landed on the airport, Notification stopped"
              );
            }
          } else {
            console.log("Flight data not found in the database.");
          }
        } catch (error) {
          console.error(
            "Error updating flight data and sending notifications:",
            error
          );
        }
      });
      //start the cron job
      scheduledJob.start();
      if (twilioResponse1) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } else {
      // Mobile & email already exist in the database
      res.json({ success: "exist", flight: mobileChecker.flightNumber[0] });
    }
  } catch (error) {
    console.error("Error sending message via Twilio:", error);
    res.json({ success: false, error: error.message });
  }
});

// Function to fetch flight data
async function fetchFlightData(flightNumber) {
  const options = {
    method: "GET",
    url: `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}`,
    params: {
      withAircraftImage: "true",
      withLocation: "true",
    },
    headers: {
      "X-RapidAPI-Key": process.env.FLIGHTDATA_API_KEY,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const flightData = response.data;
    return flightData;
  } catch (error) {
    console.error("Error fetching flight data:", error);
  }
}

// Function to update flight data and send notifications
async function updateFlightData(savedFlightData, flightData, flightNumber) {
  const notifications = [];
  const changedFields = [];

  //Status
  if (savedFlightData.status !== flightData[0].status) {
    savedFlightData.status = flightData[0].status;
    changedFields.push({
      field: `Flight ${flightNumber}: Status`,
      value: flightData[0].status,
    });
  }

  //Departure ActualTime
  if (
    savedFlightData.departure.actualTime !==
    `${
      flightData[0].departure.actualTimeLocal
        ? flightData[0].departure.actualTimeLocal
        : "N/A"
    }`
  ) {
    savedFlightData.departure.actualTime =
      flightData[0].departure.actualTimeLocal;
    changedFields.push({
      field: `Flight ${flightNumber}: Departure Time`,
      value: `${new Date(
        flightData[0].departure.actualTimeLocal
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    });
  }

  //Departure Terminal
  if (
    savedFlightData.departure.terminal !==
    `${
      flightData[0].departure.terminal
        ? flightData[0].departure.terminal
        : "N/A"
    }`
  ) {
    savedFlightData.departure.terminal = flightData[0].departure.terminal;
    changedFields.push({
      field: `Flight ${flightNumber}: Departure Terminal`,
      value: flightData[0].departure.terminal,
    });
  }

  //Departure Gate
  if (
    savedFlightData.departure.gate !==
    `${flightData[0].departure.gate ? flightData[0].departure.gate : "N/A"}`
  ) {
    savedFlightData.departure.gate = flightData[0].departure.gate;
    changedFields.push({
      field: `Flight ${flightNumber}: Departure Gate`,
      value: flightData[0].departure.gate,
    });
  }

  //Departure Check-in Desk
  if (
    savedFlightData.departure.checkinDesk !==
    `${
      flightData[0].departure.checkInDesk
        ? flightData[0].departure.checkInDesk
        : "N/A"
    }`
  ) {
    savedFlightData.departure.checkinDesk = flightData[0].departure.checkInDesk;
    changedFields.push({
      field: `Flight ${flightNumber}: Check-in Desk`,
      value: flightData[0].departure.checkInDesk,
    });
  }

  //Arrival ActualTime
  if (
    savedFlightData.arrival.actualTime !==
    `${
      flightData[0].arrival.actualTimeLocal
        ? flightData[0].arrival.actualTimeLocal
        : "N/A"
    }`
  ) {
    savedFlightData.arrival.actualTime = flightData[0].arrival.actualTimeLocal;
    changedFields.push({
      field: `Flight ${flightNumber}: Arrival Time`,
      value: `${new Date(
        flightData[0].arrival.actualTimeLocal
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    });
  }

  //Arrival Terminal
  if (
    savedFlightData.arrival.terminal !==
    `${flightData[0].arrival.terminal ? flightData[0].arrival.terminal : "N/A"}`
  ) {
    savedFlightData.arrival.terminal = flightData[0].arrival.terminal;
    changedFields.push({
      field: `Flight ${flightNumber}: Arrival Terminal`,
      value: flightData[0].arrival.terminal,
    });
  }

  //Arrival Gate
  if (
    savedFlightData.arrival.gate !==
    `${flightData[0].arrival.gate ? flightData[0].arrival.gate : "N/A"}`
  ) {
    savedFlightData.arrival.gate = flightData[0].arrival.gate;
    changedFields.push({
      field: `Flight ${flightNumber}: Arrival Gate`,
      value: flightData[0].arrival.gate,
    });
  }

  //Arrival baggage belt
  if (
    savedFlightData.arrival.baggageBelt !==
    `${
      flightData[0].arrival.baggageBelt
        ? flightData[0].arrival.baggageBelt
        : "N/A"
    }`
  ) {
    savedFlightData.arrival.baggageBelt = flightData[0].arrival.baggageBelt;
    changedFields.push({
      field: `Flight ${flightNumber}: Baggage Belt`,
      value: flightData[0].arrival.baggageBelt,
    });
  }

  if (changedFields.length > 0) {
    //update the flight data in the DB
    await savedFlightData.save();
    const notificationMessage = changedFields
      .map(({ field, value }) => `${field} has changed to ${value}`)
      .join("\n");

    notifications.push({
      message: notificationMessage,
    });
  } else {
    console.log("No changes in flight data. Ignoring.");
  }

  return notifications;
}

// Function to send a notification
async function sendNotification(message, mobile, email) {
  try {
    // Send the message using Twilio
    const twilioResponse = await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886", //Twilio phone number
      to: `whatsapp:${mobile}`, // user phone number
    });
    console.log("Notification sent successfully");

    // Create a transporter using your Gmail SMTP credentials
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email version of the message with <br> line breaks
    const emailMessage = message.replace(/\n/g, "<br>");

    // Configure the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "AeroFinder flight alerts",
      html: `<p>Dear AeroFinder user,</p>
    <div>${emailMessage}</div>
    <p>For more information visit AeroFinder</p>
    <p>Regards,</p>
    <p>The AeroFinder Team</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    return twilioResponse;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

// Route for handling incoming messages
router.post("/incomingMessage", async (req, res) => {
  const userMessage = req.body.Body;
  const lowerCaseUserMessage = userMessage.toLowerCase();
  const userMobileNumber = req.body.From;

  if (lowerCaseUserMessage.includes("end")) {
    scheduledJob.stop();
    console.log("Cron job has been stopped.");

    // Retrieve the user's email address associated with the mobile number
    const userRecord = await db.Notification.findOne({
      mobile: userMobileNumber,
    });
    if (userRecord) {
      const userEmail = userRecord.email;
      const flightNumber = userRecord.flightNumber;

      // Send the final message to the user via WhatsApp and email
      const finalMessage =
        "Thank you for using AeroFinder. For more information visit AeroFinder app";
      await sendNotification(finalMessage, userMobileNumber, userEmail);
      await db.FlightData.deleteOne({ flightNumber: flightNumber });
      await db.Notification.deleteOne({ mobile: userMobileNumber });
    }
  }
  res.end();
});

module.exports = router;
