
const express = require("express");
const router = express.Router();
const Books = require("../models/Books");

router.post("/", (req, res, next) => {
  delete req.body._id;
  const book = new Books({
    ...req.body,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
});

router.put("/:id", (req, res, next) => {
  Books.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "objet modifié" }))
    .catch((error) => res.status(400).json({ error }));
});

router.get("/", (req, res, next) => {
  Books.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
});

router.delete("/:id", (req, res, next) => {
  Books.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "objet supprimé" }))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = router;