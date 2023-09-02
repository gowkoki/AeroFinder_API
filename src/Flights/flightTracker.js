const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route to track flights based on callSign
router.get("/flightTracker", async (req, res) => {
  const callSign = req.query.callSign;

  try {
    // Fetch flight data from opensky-network API
    const response = await axios.get(
      `https://opensky-network.org/api/states/all`
    );

    if (response.status === 200) {
      const data = response.data;

      // Filter data based on callsign
      const filteredData = data.states.filter(
        (flight) => flight[1].trim() === callSign.trim()
      );

      if (filteredData.length > 0) {
        // Respond with the filtered flight data
        console.log(filteredData);
        res.status(200).json(filteredData);
      } else {
        // No matching flight found
        res.status(404).json({ error: "Flight not found" });
      }
    } else {
      // Error fetching flight data
      res.status(500).json({ error: "Unable to fetch flight data" });
    }
  } catch (error) {
    // Error handling for API request
    console.error("Error fetching flight data:", error);
    res.status(500).json({ error: "Unable to fetch flight data" });
  }
});
module.exports = router;
