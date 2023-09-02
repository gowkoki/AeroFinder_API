const mongoose = require("mongoose");

// Define a function to establish a connection to the database
async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/flight", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
    throw error; // Rethrow the error for better error handling upstream
  }
}

// Export the mongoose object and the connectToDatabase function
module.exports = { mongoose, connectToDatabase };
