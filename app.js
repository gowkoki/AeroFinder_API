// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const oneDay = 1000 * 60 * 60 * 24;

// Import routes
const home = require("./src/Flights/homeRoute.js");
const search = require("./src/Flights/searchByRoute.js");
const airport = require("./src/Airports/airportRoute.js");
const login = require("./src/LoginLogout/loginRoute.js");
const logout = require("./src/LoginLogout/logoutRoute.js");
const register = require("./src/Register/registerRoute.js");
const airportDepArr = require("./src/Airports/airportDepArrRoute.js");
const weather = require("./src/Airports/weatherRoute.js");
const notification = require("./src/Flights/notificationRoute.js");
const mobile = require("./src/Register/mobileVerifyRoute.js");
const email = require("./src/Register/emailVerifyRoutr.js");
const myAccount = require("./src/Register/myAccountRoute.js");
const airportMap = require("./src/Airports/airportMapRoute.js");
const airlines = require("./src/Airports/airlinesAirportsListRoute.js");
const flightTracker = require("./src/Flights/flightTracker.js");

// Configure session middleware
app.use(
  session({
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: oneDay,
      httpOnly: true,
    },
  })
);
// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Enable CORS with specified options
app.use(
  cors({
    origin: [
      "https://aerofinder.onrender.com",
      "https://aeroFinder.onrender.com/",
    ],
    credentials: true,
  })
);

// Parse JSON in the body of requests
app.use(bodyParser.json());

// Route middleware
app.use("/", home);
app.use("/", airport);
app.use("/", login);
app.use("/", logout);
app.use("/", register);
app.use("/", search);
app.use("/", airportDepArr);
app.use("/", weather);
app.use("/", notification);
app.use("/", mobile);
app.use("/", email);
app.use("/", myAccount);
app.use("/", airportMap);
app.use("/", airlines);
app.use("/", flightTracker);

// Start the server
app.listen(8000, () => {
  console.log("Port 8000 is running");
});
