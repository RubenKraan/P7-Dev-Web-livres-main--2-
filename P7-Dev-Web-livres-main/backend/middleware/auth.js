// Import the jsonwebtoken library and assign it to the jwt variable
const jwt = require("jsonwebtoken");

// Define a middleware function that takes three arguments: req, res, and next
module.exports = (req, res, next) => {
  // Try to extract the JWT from the Authorization header of the request
  // The header value is expected to be in the format "Bearer {token}"
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(req.headers.authorization);

    // Verify the token's signature and decode its payload using the jwt.verify() method
    // The secret key used to sign the token is "RANDOM_TOKEN_SECRET"
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");

    // Extract the userId property from the decoded payload
    const userId = decodedToken.userId;

    // Create a new object req.auth and assign the userId property to it
    req.auth = {
      userId: userId,
    };

    // Log the Authorization header value for debugging purposes
    console.log(req.headers.authorization);

    // Pass control to the next middleware function
    next();
  } catch (error) {
    // If an error occurs during the verification process,
    // send a 401 (Unauthorized) response with an error message
    res.status(401).json({ error: "Authentification échouée" });
  }
};