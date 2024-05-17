const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment");

// Route to fetch departure and arrival flights from an airport
router.get("/airport/departure/arrival", async (req, res) => {
  const airport = req.query.airport;
  console.log(airport);

  // Get the current date and time in the specified format
  const currentDateTime = moment().format("YYYY-MM-DDTHH:mm");
  console.log(currentDateTime);

  // Calculate the end date and time (current date and time + 12 hours)
  const endDateTime = moment().add(12, "hours").format("YYYY-MM-DDTHH:mm");
  console.log(endDateTime);

  // Define API request options for fetching flights
  const options = {
    method: "GET",
    url: `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${airport}/${currentDateTime}/${endDateTime}`,
    params: {
      withLeg: "true",
      withCancelled: "true",
      withCodeshared: "true",
      withCargo: "true",
      withPrivate: "true",
      withLocation: "false",
    },
    headers: {
      "X-RapidAPI-Key": process.env.FLIGHTDATA_API_KEY,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);

    if (response.data) {
      res.json({
        // Respond with departure and arrival flights data and status
        departureFlights: response.data.departures,
        arrivalFlights: response.data.arrivals,
        status: "success",
      });
    } else {
      res.json({ status: "error" });
    }
  } catch (error) {
    console.error(error);
    // Respond with an error status
    res.json({ status: "error" });
  }
});

module.exports = router;
