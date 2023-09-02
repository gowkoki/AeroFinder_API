const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route to fetch airport information based on IATA code
router.get("/airportMap", async (req, res) => {
  const airportCode = req.query.airportCode;
  console.log(airportCode);

  // Define API request options for fetching airport information
  const options = {
    method: "GET",
    url: "https://airport-info.p.rapidapi.com/airport",
    params: { iata: airportCode },
    headers: {
      "X-RapidAPI-Key": process.env.FLIGHTDATA_API_KEY,
      "X-RapidAPI-Host": "airport-info.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);

    if (response.data) {
      // Respond with fetched airport data and status
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
