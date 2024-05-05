const mongoose = require("mongoose"); // Importing mongoose library

// Defining a schema for book ratings
const booksRatingSchema = mongoose.Schema({
  userId: { type: String, required: true }, // User ID of the person who rated the book
  grade: { type: Number, required: true }, // Rating given by the user (e.g., 1-5)
});

// Defining a schema for book details
const booksSchema = mongoose.Schema({
  title: { type: String, required: true }, // Title of the book
  author: { type: String, required: true }, // Author of the book
  imageUrl: { type: String, required: true }, // URL of the book cover image
  year: { type: Number, required: true }, // Year of publication
  genre: { type: String, required: true }, // Genre of the book (e.g., fiction, non-fiction, etc.)
  ratings: [booksRatingSchema], // Array of ratings from multiple users
  averageRating: { type: Number, required: true }, // Average rating of the book
});

// Creating a Mongoose model for books based on the booksSchema
module.exports = mongoose.model("Books", booksSchema);