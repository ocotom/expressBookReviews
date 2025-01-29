const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to check if user exists
const userExists = (username) => {
  return users.some(user => user.username === username);
};

public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  // Check both are provided
  if (username && password) {
    if (userExists(username)) {
      return res.status(400).json({message: "User already exists"});
    } else {
      // Add new user to the users database
      users.push({ username, password });
      return res.status(200).json({message: "User registered successfully"});
    }
  } else {
    return res.status(400).json({message: "Username and password are required"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn],null,4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  if (author) {
    let booksByAuthor = Object.values(books).filter((book) => book.author === author);
    if (booksByAuthor.length > 0) {
      return res.send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      return res.status(404).json({message: "No books found by this author"});
    }
  }
  return res.status(404).json({message:"No books found by this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  if (title) {
    let booksByTitle = Object.values(books).filter((book)=> book.title === title);
    if(booksByTitle.length > 0){
      return res.send(JSON.stringify(booksByTitle,null,4));
    } else {
      return res.status(404).json({message:"No books found for this title"});
    }
  }
  return res.status(404).json({message:"No books found for this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    if (book.reviews) {
      return res.send(JSON.stringify(book.reviews),null,4);
    }
  }
  return res.status(404).json({message: "No books found"});
});

module.exports.general = public_users;
