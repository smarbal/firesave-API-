const bcrypt = require("bcrypt");
const db = require('../models/index');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = db.User;
const Prom = db.Prom;


exports.verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_PASSWORD);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

exports.login = async (req, res) => {
  let user = await User.findOne({ where: { username: req.body.username } });
  if (user === null) {
    res.status(401).send("User not found")
  } else {
    let result = bcrypt.compareSync(req.body.password, user.password)

    if (result) {
      console.log("User:", JSON.stringify(user, null, 2));
      let privateKey = process.env.JWT_PASSWORD;
      let token = jwt.sign({ "service_number": User.service_number }, privateKey);
      res.send({ "token": token });
    }

    else {
      res.status(401).send("Can't log you in !")
    }
  }
}