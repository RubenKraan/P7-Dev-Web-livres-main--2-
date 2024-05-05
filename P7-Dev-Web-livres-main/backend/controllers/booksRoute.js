// Import the necessary modules
const { unlink } = require("../app");
const Book = require("../models/Books");
const fs = require("fs");
const sharp = require("sharp");

// Define the createBook function, which handles the creation of a new book object in the database
exports.createBook = (req, res, next) => {
  // Parse the book object from the request body
  const BookObject = JSON.parse(req.body.book);
  
  // Remove the _id and _userId properties from the book object
  delete BookObject._id;
  delete BookObject._userId;
  
  // Define the image path and webp format path
  const imagePath = `images/${req.file.filename}`;
  const webpFormat = `images/${req.file.filename}.webp`;
  
  // Use sharp to resize the image and convert it to webp format
  sharp(imagePath)
    .resize({ width: 400, height: 400 })
    .webp({ quality: 80 })
    .toFile(webpFormat, (conversionError, info) => {
      if (conversionError) {
        // Return a 500 error response if there's an error converting the image
        return res
          .status(500)
          .json({ error: "Erreur lors de la conversion de l'image en WebP" });
      }
      
      // Remove the original image after conversion
      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError) {
          // Log an error if there's a problem deleting the original image
          console.error(
            "Erreur lors de la suppression de l'image d'origine:",
            unlinkError
          );
        }
        
        // Create a new book document with the parsed book object and user ID
        const book = new Book({
          ...BookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}.webp`,
        });
        
        // Save the book document to the database
        book
          .save()
          .then(() => {
            // Return a 201 response with a success message
            res.status(201).json({ message: "Objet créé" });
          })
          .catch((error) => {
            // Return a 400 response with the error if there's a problem saving the book
            res.status(400).json({ error });
          });
      });
    });
};

// This function, modifyBook, is an exported Express.js route handler that allows users to modify a book's details.
exports.modifyBook = (req, res, next) => {

  // Find the book with the given ID from the request parameters.
  Book.findById({ _id: req.params.id })
   .then((book) => {

      // If the book is not found, return a 404 Not Found status with an error message.
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      // Find the user's rating for the book.
      const userRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      // If the user is not authorized to modify the book, return a 401 Unauthorized status with an error message.
      if (!userRating) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      // Initialize a bookObject variable to store the updated book data.
      let bookObject;

      // Check if a file (image) is included in the request.
      if (req.file) {

        // If a file is included, generate the image path and WebP format path.
        const imagePath = `images/${req.file.filename}`;
        const webpFormat = `images/${req.file.filename}.webp`;

        // Use the Sharp library to resize the image and convert it to WebP format.
        sharp(imagePath)
         .resize({ width: 400, height: 400 })
         .webp({ quality: 80 })
         .toFile(webpFormat, (conversionError, info) => {

            // If there is an error during the conversion, return a 500 Internal Server Error status with an error message.
            if (conversionError) {
              return res.status(500).json({
                error: "Erreur lors de la conversion de l'image en WebP",
              });
            }

            // Delete the original image file.
            fs.unlink(imagePath, (unlinkError) => {

              // If there is an error during the deletion, log the error.
              if (unlinkError) {
                console.error(
                  "Erreur lors de la suppression de l'image d'origine:",
                  unlinkError
                );
              }

              // Create the bookObject with the updated book data and the new image URL.
              bookObject = {
               ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
                }.webp`,
              };

              // Call the updateBook function to update the book in the database.
              updateBook(book, bookObject, req, res);
            });
          });
      } else {

        // If no file is included, create the bookObject with the updated book data from the request body.
        bookObject = {...req.body };
        delete bookObject._userId;
        updateBook(book, bookObject, req, res);
      }
    })
   .catch((error) => {

      // If there is an error, return a 400 Bad Request status with the error message.
      res.status(400).json({ error });
    });
};

// Fonction pour mettre à jour chaque livre modifié par l'user
function updateBook(book, bookObject, req, res) {
  // Use the Book.updateOne method to update a single document in the Book collection based on the _id property specified in req.params.id
  // The updated document will have the properties specified in bookObject, as well as the _id property from req.params.id
  Book.updateOne({ _id: req.params.id }, {...bookObject, _id: req.params.id })
   .then(() => {
      // If the update is successful, send a response with a status code of 200 and a message indicating that the object has been updated
      res.status(200).json({ message: "Objet modifié" });
    })
   .catch((error) => {
      // If there is an error during the update, send a response with a status code of 400 and an error message
      res.status(400).json({ error });
    });
}

// Exported function to retrieve all books from the database
exports.getAllBook = (req, res, next) => {
  // Use the Book.find() method to query the database and retrieve all documents in the Book collection
  Book.find()
   .then((books) => {
      // If the query is successful, send a JSON response with a status code of 200, containing an array of all books
      res.status(200).json(books);
    })
   .catch((error) => {
      // If an error occurs, send a JSON response with a status code of 400, containing an error message
      res.status(400).json({ error });
    });
};

// Exported function to retrieve a single book from the database by its _id field
exports.getOneBook = (req, res, next) => {
  // Use the Book.findOne() method to query the database, specifying the _id field as a filter
  // The _id value is retrieved from the req.params.id property, which suggests that this function is designed to work with a RESTful API route that accepts an id parameter
  Book.findOne({ _id: req.params.id })
   .then((book) => {
      // If the query is successful, send a JSON response with a status code of 200, containing the retrieved book document
      res.status(200).json(book);
    })
   .catch((error) => {
      // If an error occurs, send a JSON response with a status code of 400, containing an error message
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  // Find a book by its ID
  Book.findById({ _id: req.params.id })
    .then((book) => {
      // If no book is found, return a 404 error
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      // Find the user's rating for the book
      const userRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      // If the user has no rating, return a 403 error
      if (!userRating) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      // Extract the filename from the book's image URL
      const filename = book.imageUrl.split("/images/")[1];

      // Delete the image file
      fs.unlink(`images/${filename}`, () => {
        // Delete the book from the database
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            // Return a success message
            res.status(200).json({ message: "objet supprimé !" });
          })
          .catch((error) => {
            // Return an error message if deletion fails
            res.status(500).json({ error });
          });
      });
    })
    .catch((error) => {
      // Return an error message if finding the book fails
      res.status(500).json({ error });
    });
};

// Function to retrieve the top 10 best-rated books from the database
exports.getBestRatedBooks = (req, res, next) => {
  // Find all books in the database
  Book.find()
    // Sort books by average rating in descending order
   .sort({ averageRating: -1 })
    // Limit the results to the top 10 books
   .limit(10)
    // Handle the promise when the query is successful
   .then((bestRatedBooks) => {
      // Set the HTTP response status code to 200 (OK)
      res.status(200)
        // Send the top 10 best-rated books as JSON in the response body
       .json(bestRatedBooks);
    })
    // Handle the promise when an error occurs
   .catch((error) => {
      // Set the HTTP response status code to 500 (Internal Server Error)
      res.status(500)
        // Send a JSON object with an 'error' property set to "Internal server error"
       .json({ error: "Internal server error" });
    });
};

// Function to rate a book and calculate the average rating
exports.rateBook = (req, res, next) => {
  // Extract user ID and rating from request body
  const userId = req.body.userId;
  const rating = req.body.rating;

  // Check if rating is within valid range (0-5)
  if (rating < 0 || rating > 5) {
    return res
     .status(400)
     .json({ error: "La note doit être comprise entre 0 et 5." });
  }

  // Find book with given ID
  Book.findById(req.params.id)
   .then((book) => {
      // Check if book is found
      if (!book) {
        return res.status(404).json({ error: "Livre introuvable." });
      }

      // Check if user has already rated the book
      const userRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (userRating) {
        return res
         .status(400)
         .json({ error: "L'utilisateur a déjà noté ce livre." });
      }

      // Create new rating object and add it to ratings array
      const newRating = {
        userId: userId,
        grade: rating,
      };
      book.ratings.push(newRating);

      // Calculate new average rating and update book object
      book.averageRating = calculateAverageRating(book.ratings);

      // Save updated book object
      return book.save();
    })
   .then((updatedBook) => {
      // Return 200 OK response with updated book object
      res.status(200).json(updatedBook);
    })
   .catch((error) => {
      // Return 500 Internal Server Error response with error message
      res
       .status(500)
       .json({ error: "Erreur serveur lors de la notation du livre." });
    });
};

// Function to calculate average rating of an array of ratings
function calculateAverageRating(ratings) {
  // Check if array is empty
  if (ratings.length === 0) {
    return 0;
  }

  // Calculate total rating and return average rating
  const totalRating = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return totalRating / ratings.length;
}
