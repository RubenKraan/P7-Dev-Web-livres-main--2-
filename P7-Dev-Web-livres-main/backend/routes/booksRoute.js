const express = require("express"); // Importing the Express.js library
const router = express.Router(); // Creating a new router instance

const bookCtrl = require("../controllers/booksRoute"); // Importing book controller
const auth = require("../middleware/auth"); // Importing authentication middleware
const multer = require("../middleware/multer-config"); // Importing multer configuration for file uploads

// Route to create a new book
router.post("/", auth, multer, bookCtrl.createBook);

// Route to modify an existing book
router.put("/:id", auth, multer, bookCtrl.modifyBook);

// Route to retrieve all books
router.get("/", bookCtrl.getAllBook);

// Route to retrieve the best-rated books
router.get("/bestrating", bookCtrl.getBestRatedBooks);

// Route to retrieve a single book by its ID
router.get("/:id", bookCtrl.getOneBook);

// Route to rate a book
router.post("/:id/rating", bookCtrl.rateBook);

// Route to delete a book
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router; // Exporting the router instance