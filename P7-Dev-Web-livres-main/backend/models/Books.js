const mongoose = require("mongoose");

const booksRatingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true },
});
const booksSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [booksRatingSchema],
  averageRating: { type: Number, required: true },
});

module.exports = mongoose.model("Books", booksSchema);