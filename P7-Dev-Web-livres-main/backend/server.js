const http = require("http"); // import http module
const app = require("./app"); // import app module

// Function to normalize the port value
const normalizePort = (val) => {
  const port = parseInt(val, 10); // parse the value as an integer

  if (isNaN(port)) { // if the value cannot be parsed as an integer
    return val; // return the original value
  }
  if (port >= 0) { // if the port value is valid
    return port; // return the port value
  }
  return false; // return false if the port value is invalid
};

// Set the port value from the environment variable or default to 5000
const port = normalizePort(process.env.PORT || "5000");
app.set("port", port); // set the port value in the app

// Error handler function
const errorHandler = (error) => {
  if (error.syscall !== "listen") { // if the error is not related to listening
    throw error; // rethrow the error
  }
  const address = server.address(); // get the server address
  const bind = 
    typeof address === "string" ? "pipe " + address : "port: " + port; // determine the bind type

  switch (error.code) { // handle specific error codes
    case "EACCES":
      console.error(bind + " requires elevated privileges."); // permission error
      process.exit(1); // exit with error code 1
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use."); // address in use error
      process.exit(1); // exit with error code 1
      break;
    default:
      throw error; // rethrow the error for other cases
  }
};

// Create an HTTP server using the app
const server = http.createServer(app);

// Register error event handler
server.on("error", errorHandler);

// Register listening event handler
server.on("listening", () => {
  const address = server.address(); // get the server address
  const bind = typeof address === "string" ? "pipe " + address : "port " + port; // determine the bind type
  console.log("Listening on " + bind); // log the listening message
});

// Start the server listening on the specified port
server.listen(port);