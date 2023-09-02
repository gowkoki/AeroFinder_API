const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route to fetch airport information and local time based on IATA code
router.get("/airport", async (req, res) => {
  const airport = req.query.airport;

  // Define API request options for fetching airport information
  const options1 = {
    method: "GET",
    url: `https://aerodatabox.p.rapidapi.com/airports/iata/${airport}`,
    headers: {
      "X-RapidAPI-Key": process.env.FLIGHTDATA_API_KEY,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
    },
  };

  // Define API request options for fetching local time at the airport
  const options2 = {
    method: "GET",
    url: `https://aerodatabox.p.rapidapi.com/airports/iata/${airport}/time/local`,
    headers: {
      "X-RapidAPI-Key": process.env.FLIGHTDATA_API_KEY,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
    },
  };

  try {
    // Use Promise.all to make both API requests in parallel
    const [response1, response2] = await Promise.all([
      axios.request(options1),
      axios.request(options2),
    ]);

    if (response1.data && response2.data) {
      // Respond with fetched data and status
      res.json({
        data1: response1.data,
        data2: response2.data,
        status: "success",
      });
    } else {
      res.json({ status: "error" });
    }
  } catch (error) {
    console.error(error);
    res.json({ status: "error" });
  }
});

module.exports = router;
