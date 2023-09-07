const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment"); // format the date

// Route to fetch flight route data based on specific criteria
router.get("/route", async (req, res) => {
  try {
    // Extract query parameters
    const { airlines, departAirport, arrivalAirport, departDate, departTime } =
      req.query;

    // Split departTime into start and end times
    const [startTime, endTime] = departTime.split("-");

    // Create moment objects for the given departDate and times
    const depStart = moment(`${departDate}T${startTime}`);
    const depEnd = moment(`${departDate}T${endTime}`);

    // Format the moment objects as YYYY-MM-DDTHH:mm
    const formattedDepStart = depStart.format("YYYY-MM-DDTHH:mm");
    const formattedDepEnd = depEnd.format("YYYY-MM-DDTHH:mm");

    // Flight Status API options
    const options = {
      method: "GET",
      url: `https://aerodatabox.p.rapidapi.com/flights/airports/iata/${departAirport}/${formattedDepStart}/${formattedDepEnd}`,
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

    // Send the request to the Flight Status API
    const response = await axios.request(options);

    // Filter flights based on criteria
    const filteredFlights = response.data.departures.filter((flight) => {
      const airlineCode = flight.number.substring(0, 2);
      return (
        flight.arrival.airport.iata === arrivalAirport &&
        airlines.includes(airlineCode)
      );
    });

    if (filteredFlights.length > 0) {
      const flightNumber = filteredFlights[0].number;
      // Fetch detailed flight data using the flightNumber
      let endpoint = `https://aerofinderapi.onrender.com/home?flightNumber=${flightNumber}&departDate=${departDate}`;
      const innerResponse = await axios.get(endpoint);
      res.json({ data: innerResponse.data });
    } else {
      // No matching flights found
      res.json({ status: "Invalid" });
      console.log("No matching flights found");
    }
  } catch (error) {
    // Handle errors and respond with an error status
    res.json({ status: "Invalid" });
    console.error(error);
  }
});

module.exports = router;
