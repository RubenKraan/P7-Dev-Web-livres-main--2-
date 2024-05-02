const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/booksRoute");
const auth = require("../middleware/auth");

router.post("/", auth, bookCtrl.createBook);

router.put("/:id", auth, bookCtrl.modifyBook);

router.get("/", bookCtrl.getAllBook);

router.get("/:id", bookCtrl.getOneBook);

router.get("/bestrating", bookCtrl.getBestRatedBooks);

router.delete("/:id", auth, bookCtrl.deleteBook);

router.post("/:id/rating", bookCtrl.rateBook);

module.exports = router;