const Book = require("../models/Books");

exports.createBook = (req, res, next) => {
  console.log("les donner", req.body);
  const book = new Book({
    ...req.body,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "objet modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "objet supprimé" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(10)
    .then((bestRatedBooks) => {
      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

// controllers/booksRoute.js
exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  // Assurez-vous que la note est entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({ error: "La note doit être comprise entre 0 et 5." });
  }

  // Recherchez le livre par son ID
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre introuvable." });
      }

      const userRating = book.rating.find((rating) => rating.userId === userId);
      if (userRating) {
        return res
          .status(400)
          .json({ error: "L'utilisateur a déjà noté ce livre." });
      }

      const newRating = {
        userId: userId,
        grade: rating,
      };
      book.rating.push(newRating);
      book.averageRating = calculateAverageRating(book.rating);

      // Sauvegardez les modifications
      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la notation du livre." });
    });
};

function calculateAverageRating(ratings) {
  if (ratings.length === 0) {
    return 0;
  }

  const totalRating = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return totalRating / ratings.length;
}