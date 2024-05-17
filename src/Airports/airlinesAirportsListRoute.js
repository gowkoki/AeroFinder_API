const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route to fetch a list of airlines
router.get("/airlines", async (req, res) => {
  const options = {
    method: "GET",
    url: "https://flight-radar1.p.rapidapi.com/airlines/list",
    headers: {
      "X-RapidAPI-Key": process.env.GATE_LOCATION_API_KEY,
      "X-RapidAPI-Host": "flight-radar1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    if (response.data) {
      // Respond with the fetched airlines data and status
      res.json({
        data: response.data,
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

// Route to fetch a list of airports
router.get("/airports", async (req, res) => {
  const options = {
    method: "GET",
    url: "https://flight-radar1.p.rapidapi.com/airports/list",
    headers: {
      "X-RapidAPI-Key": process.env.GATE_LOCATION_API_KEY,
      "X-RapidAPI-Host": "flight-radar1.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);

    if (response.data) {
      // Respond with the fetched airports data and status
      res.json({
        data: response.data,
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
