const mongoose = require("mongoose");

// Define a function to establish a connection to the database
async function connectToDatabase() {
  try {
    await mongoose.connect(
      "mongodb+srv://gowkoki:lB5roebifZuy70Fc@flight.icyq6cf.mongodb.net/flight?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
    throw error; // Rethrow the error for better error handling upstream
  }
}

// Export the mongoose object and the connectToDatabase function
module.exports = { mongoose, connectToDatabase };
