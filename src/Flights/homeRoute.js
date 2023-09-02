const express = require("express");
const router = express.Router();
const axios = require("axios");

// Route for fetching flight data
router.get("/home", async (req, res) => {
  const flightNumber = req.query.flightNumber;
  const departDate = req.query.departDate;
  let depLocation = ""; // To store departure location information

  // Determine the appropriate API URL based on the presence of departDate
  let url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}`;
  if (departDate) {
    url = `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${departDate}`;
  }

  // Set up options for fetching flight status
  const options = {
    method: "GET",
    url,
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

    if (response.data[0]) {
      // Extract relevant flight data
      const departureGate = response.data[0].departure.gate;
      const departureTerminal = response.data[0].departure.terminal;
      const departAir = response.data[0].departure.airport.name;

      // Determine location of departure gate or terminal
      if (departureGate) {
        // Fetch location information for departure gate
        const departGateLocation = {
          method: "GET",
          url: "https://google-maps-geocoding3.p.rapidapi.com/geocode",
          params: {
            address: `Gate ${departureGate},${departAir} Airport`,
          },
          headers: {
            "X-RapidAPI-Key": process.env.GATE_LOCATION_API_KEY,
            "X-RapidAPI-Host": "google-maps-geocoding3.p.rapidapi.com",
          },
        };

        // Fetch location information using axios
        const departGateLocresponse = await axios.request(departGateLocation);
        console.log(departGateLocresponse.data);

        // Check if location information is available and store it
        if (
          departGateLocresponse.data.latitude != "" &&
          departGateLocresponse.data.longitude != ""
        ) {
          depLocation = departGateLocresponse.data;
        } else {
          console.log("terminal");
          // Fetch location information for departure terminal
          const departTerminalLocation = {
            method: "GET",
            url: "https://google-maps-geocoding3.p.rapidapi.com/geocode",
            params: {
              address: `Terminal ${departureTerminal},${departAir} Airport`,
            },
            headers: {
              "X-RapidAPI-Key": process.env.GATE_LOCATION_API_KEY,
              "X-RapidAPI-Host": "google-maps-geocoding3.p.rapidapi.com",
            },
          };

          // Fetch location information using axios
          const departTerminalLocresponse = await axios.request(
            departTerminalLocation
          );
          console.log(departTerminalLocresponse.data);
          depLocation = departTerminalLocresponse.data;
        }
      }

      if (response.data) {
        // Respond with flight data and departure location information
        res.json({
          data: response.data,
          dpartLoc: depLocation ? depLocation : "none",
          status: "success",
        });
      } else {
        res.json({ status: "error" });
      }
    } else {
      console.log("Invalid Flight Number");
      res.json({ status: "Invalid" });
    }
  } catch (error) {
    console.error(error);
    // Handle errors here, such as responding with an error status
    res.json({ status: "error" });
  }
});

module.exports = router;
