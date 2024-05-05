const multer = require("multer"); // Importing multer library

// Defining allowed MIME types for file uploads
const MIME_TYPE_MAP = {
  "image/webp": "webp",
};

// Configuring storage for uploaded files using multer.diskStorage()
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Setting the destination directory for uploaded files
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // Generating a unique filename for the uploaded file
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPE_MAP[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// Creating a multer instance with the configured storage
module.exports = multer({ storage }).single("image");