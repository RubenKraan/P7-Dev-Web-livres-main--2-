// Import the Express.js framework and create a new express router
const express = require("express");
const router = express.Router();

// Import the user controller module from the controllers folder
const userCtrl = require("../controllers/user");

// Define a POST route for user signup, calling the signup function from the user controller
router.post("/signup", userCtrl.signup);

// Define a POST route for user login, calling the login function from the user controller
router.post("/login", userCtrl.login);

// Export the router module to be used in other parts of the application
module.exports = router;