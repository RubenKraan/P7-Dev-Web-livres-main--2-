const mongoose = require("mongoose"); // Import the mongoose library to interact with MongoDB
const uniqueValidator = require("mongoose-unique-validator"); // Import the uniqueValidator plugin to ensure unique values for certain fields

const userSchema = mongoose.Schema({ // Define the schema for the User model
  email: { type: String, required: true, unique: true }, // The email field is a string, required, and unique
  password: { type: String, required: true }, // The password field is a string and required
});

userSchema.plugin(uniqueValidator); // Add the uniqueValidator plugin to the userSchema

module.exports = mongoose.model("User", userSchema); // Export the User model
