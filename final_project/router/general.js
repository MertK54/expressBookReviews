const express = require("express");
const books = require("./booksdb");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("./auth_users.js").axios;

public_users.post("/register", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registred." });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

public_users.get("/", function (req, res) {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });
  };
  getBooks()
    .then((books) => {
      res.send(books);
    })
    .catch((error) => {
      console.error("Error fetching books :", error);
      res.status(404).send("Books not found");
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;

  const getBookDetails = (isbn) => {
    return new Promise((resolve, reject) => {
      const bookDetails = books[isbn];
      if (bookDetails) {
        resolve(bookDetails);
      } else {
        reject("Book not found");
      }
    });
  };
  getBookDetails(isbn)
    .then((bookDetails) => {
      res.send(bookDetails);
    })
    .catch((error) => {
      console.error("Error fetching book details:", error);
      res.status(404).send("Book not found for the isbn");
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author;
  let authorBooks = [];
  const getBookbyAuthor = () => {
    return new Promise((resolve, reject) => {
      for (const i in books) {
        if (books[i].author === author) authorBooks.push(books[i]);
      }
      if (authorBooks.length > 0) {
        resolve(authorBooks);
      } else {
        reject("Books not found for the author");
      }
    });
  };
  getBookbyAuthor()
    .then((authorBooks) => {
      res.send(authorBooks);
    })
    .catch((error) => {
      console.error("Error fetching author :", error);
      res.status(404).send("Book not found for the author");
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  let titleBooks = [];
  const getBookbyTitle = () => {
    return new Promise((resolve, reject) => {
      for (const i in books) {
        if (books[i].title === title) titleBooks.push(books[i]);
      }
      if (titleBooks.length > 0) {
        resolve(titleBooks);
      } else {
        reject("Book not fund for the title");
      }
    });
  };
  getBookbyTitle()
    .then((titleBooks) => {
      res.send(titleBooks);
    })
    .catch((error) => {
      console.error("Error fetching title :", error);
      res.status(404).send("Book not found for the title");
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
