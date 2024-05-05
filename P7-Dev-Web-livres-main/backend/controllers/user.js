// Import required modules
const User = require("../models/user.js"); // Import the User model
const bcrypt = require("bcrypt"); // Import the bcrypt library for password hashing
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library for generating JWTs

// Define the signup function
exports.signup = (req, res, next) => {
  // Hash the password using bcrypt
  bcrypt
   .hash(req.body.password, 10)
   .then((hash) => {
      // Create a new user instance with the email and hashed password
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Save the new user to the database
      user
       .save()
       .then(() => res.status(201).json({ message: "user crée" })) // Return a success response with a status code of 201
       .catch((error) => res.status(400).json({ error })); // Return an error response with a status code of 400 if there is an error saving the user
    })
   .catch((error) => res.status(500).json({ error })); // Return an error response with a status code of 500 if there is an unexpected error
};

// Define the login function
exports.login = (req, res, next) => {
  // Find a user with the provided email
  User.findOne({ email: req.body.email })
   .then((user) => {
      if (user === null) {
        // Return an error response with a status code of 401 if the user is not found
        res
         .status(401)
         .json({ message: "Paire identifiant mot de passe incorrecte" });
      } else {
        // Compare the provided password with the hashed password in the database
        bcrypt
         .compare(req.body.password, user.password)
         .then((valid) => {
            if (!valid) {
              // Return an error response with a status code of 401 if the passwords do not match
              res
               .status(401)
               .json({ message: "Paire identifiant mot de passe inccorecte" });
            } else {
              // Generate a JWT with the user's ID and return it in the response
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  {
                    userId: user._id,
                  },
                  "RANDOM_TOKEN_SECRET",
                  { expiresIn: "24h" }
                ),
              });
            }
          })
         .catch((error) => res.status(500).json({ error })); // Return an error response with a status code of 500 if there is an unexpected error
      }
    })
   .catch((error) => {
      res.status(500).json({ error }); // Return an error response with a status code of 500 if there is an unexpected error
    });
};