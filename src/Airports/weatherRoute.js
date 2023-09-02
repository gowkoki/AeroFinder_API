const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route to fetch weather data for a given latitude and longitude
router.get("/airport/weather", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  try {
    // Construct the API endpoint URL
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`;
    // Fetch weather data from OpenWeatherMap API
    const response = await axios.request(endpoint);

    if (response.data) {
      // Respond with the fetched weather data
      res.status(200).json({
        data: response.data,
        status: "success",
      });
    } else {
      // Empty data from API response
      res.status(500).json({ status: "error" });
    }
  } catch (error) {
    // Error handling for API request
    console.error("Error fetching weather data:", error);
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
