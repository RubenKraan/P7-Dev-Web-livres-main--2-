const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/booksRoute");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.get("/", bookCtrl.getAllBook);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getOneBook);
router.post("/:id/rating", bookCtrl.rateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;