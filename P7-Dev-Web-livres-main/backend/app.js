// Import the necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const booksRoute = require("./routes/booksRoute");
require("dotenv").config();
const userRoute = require("./routes/user");

// Connect to the MongoDB database
mongoose.connect(
  `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.4cis9mh.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log("Connexion à MongoDB réussie!"))
.catch((error) => console.error("Connexion à MongoDB échouée :", error));

// Create an instance of the Express app
const app = express();

// Use the body-parser middleware to parse JSON data in the request body
app.use(bodyParser.json());

// Set the Access-Control-Allow-Origin header to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Use the booksRoute module to handle requests to the /api/books endpoint
app.use("/api/books", booksRoute);

// Use the userRoute module to handle requests to the /api/auth endpoint
app.use("/api/auth/", userRoute);

// Serve static files from the "images" directory
app.use("/images", express.static(path.join(__dirname, "images")));

// Start the server and listen on the specified port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app instance for use in other modules
module.exports = app;

