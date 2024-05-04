const { unlink } = require("../app");
const Book = require("../models/Books");
const fs = require("fs");
const sharp = require("sharp");

exports.createBook = (req, res, next) => {
  const BookObject = JSON.parse(req.body.book);
  delete BookObject._id;
  delete BookObject._userId;
  const imagePath = `images/${req.file.filename}`;
  const webpFormat = `images/${req.file.filename}.webp`;

  sharp(imagePath)
    .resize({ width: 400, height: 400 })
    .webp({ quality: 80 })
    .toFile(webpFormat, (conversionError, info) => {
      if (conversionError) {
        return res
          .status(500)
          .json({ error: "Erreur lors de la conversion de l'image en WebP" });
      }

      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError) {
          console.error(
            "Erreur lors de la suppression de l'image d'origine:",
            unlinkError
          );
        }

        const book = new Book({
          ...BookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }.webp`,
        });

        book
          .save()
          .then(() => {
            res.status(201).json({ message: "Objet créé" });
          })
          .catch((error) => {
            res.status(400).json({ error });
          });
      });
    });
};

exports.modifyBook = (req, res, next) => {
  Book.findById({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      const userRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      if (!userRating) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      let bookObject;
      if (req.file) {
        const imagePath = `images/${req.file.filename}`;
        const webpFormat = `images/${req.file.filename}.webp`;

        sharp(imagePath)
          .resize({ width: 400, height: 400 })
          .webp({ quality: 80 })
          .toFile(webpFormat, (conversionError, info) => {
            if (conversionError) {
              return res.status(500).json({
                error: "Erreur lors de la conversion de l'image en WebP",
              });
            }

            fs.unlink(imagePath, (unlinkError) => {
              if (unlinkError) {
                console.error(
                  "Erreur lors de la suppression de l'image d'origine:",
                  unlinkError
                );
              }

              bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
                }.webp`,
              };

              updateBook(book, bookObject, req, res);
            });
          });
      } else {
        bookObject = { ...req.body };
        delete bookObject._userId;
        updateBook(book, bookObject, req, res);
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour mettre à jour chaque livre modifié par l'user
function updateBook(book, bookObject, req, res) {
  Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié" }))
    .catch((error) => {
      res.status(400).json({ error });
    });
}

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
  Book.findById({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre introuvable" });
      }

      const userRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      if (!userRating) {
        return res.status(403).json({ message: "Non autorisé" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "objet supprimé !" });
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
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

exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  if (rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({ error: "La note doit être comprise entre 0 et 5." });
  }

  Book.findById(req.params.id)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre introuvable." });
      }

      const userRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (userRating) {
        return res
          .status(400)
          .json({ error: "L'utilisateur a déjà noté ce livre." });
      }

      const newRating = {
        userId: userId,
        grade: rating,
      };
      book.ratings.push(newRating);
      book.averageRating = calculateAverageRating(book.ratings);

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
