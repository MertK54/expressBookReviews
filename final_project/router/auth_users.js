const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const axios = require("axios");
let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) return true;
  else return false;
};

const authenticatedUser = (username, password) => {
  let authenticatedUser = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (authenticatedUser.length > 0) return true;
  else return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken: accessToken,
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization["username"];
  const isbn = req.params.isbn;
  const reviewData = req.body;
  if (!reviewData.username || !reviewData.review) {
    return res.status(400).json({ message: "Username or review is missing." });
  }
  // Eğer belirli bir kullanıcı daha önce bu kitap için inceleme yapmışsa, bu incelemeyi güncelle
  if (books[isbn].reviews.hasOwnProperty(user)) {
    books[isbn].reviews[user] = reviewData.review;
    return res.status(200).json({ message: "Updated review." });
  } else {
    // Eğer kullanıcı daha önce bu kitap için inceleme yapmamışsa, yeni bir inceleme ekle
    books[isbn].reviews[user] = reviewData.review;
    return res.status(200).json({ message: "Added review." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization["username"];
  const isbn = req.params.isbn;

  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[user]) {
    delete books[isbn].reviews[user];
    res.status(200).json({ message: "Review successfully deleted." });
  } else {
    res.status(404).json({ message: "Review not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.axios = axios;
