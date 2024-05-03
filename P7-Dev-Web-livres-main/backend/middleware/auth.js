const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(req.headers.authorization);

    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    console.log(req.headers.authorization);
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentification échouée" });
  }
};