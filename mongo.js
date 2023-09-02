// Import Mongoose and the database connection function
const { mongoose, connectToDatabase } = require("./db");

// Establish the database connection
connectToDatabase();

// Define the User schema
const usersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
});

// Create the User model based on the User schema
const User = mongoose.model("users", usersSchema);

// Define the Flight Data schema
const flightDataSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  departure: {
    airport: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    actualTime: {
      type: String,
      required: true,
    },
    terminal: {
      type: String,
      required: true,
    },
    gate: {
      type: String,
      required: true,
    },
    checkinDesk: {
      type: String,
      required: true,
    },
  },
  arrival: {
    airport: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    actualTime: {
      type: String,
      required: true,
    },
    terminal: {
      type: String,
      required: true,
    },
    gate: {
      type: String,
      required: true,
    },
    baggageBelt: {
      type: String,
      required: true,
    },
  },
});

// Create the FlightData model based on the flightDataSchema
const FlightData = mongoose.model("flightData", flightDataSchema);

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  flightNumber: {
    type: [String],
    default: [],
  },
});

// Create the Notification model based on the notificationSchema
const Notification = mongoose.model("notification", notificationSchema);

// Export the Mongoose models
module.exports = {
  db: {
    User: User,
    FlightData: FlightData,
    Notification: Notification,
  },
};
