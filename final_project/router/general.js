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
  let promiseBook = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  });

  promiseBook.then((books) => {
    return res.send(JSON.stringify(books,null,4));
  });

  return ;
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let promiseIsbn = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  promiseIsbn.then((book) => {
    return res.send(JSON.stringify(book,null,4));
  }).catch((err) => {
    return res.status(404).json({message: err});
  });

  return ;
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let promiseAuthor = new Promise((resolve, reject) => {
    let booksByAuthor = Object.values(books).filter((book) => book.author === author);
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author");
    }
  });

  promiseAuthor.then((booksByAuthor) => {
    return res.send(JSON.stringify(booksByAuthor,null,4));
  }).catch((err) => { 
    return res.status(404).json({message: err});
  });

  return ;
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let promiseTitle = new Promise((resolve, reject) => {
    let booksByTitle = Object.values(books).filter((book)=> book.title === title);
    if(booksByTitle.length > 0){
      resolve(booksByTitle);
    } else {
      reject("No books found for this title");
    }
  });

  promiseTitle.then((booksByTitle) => {
    return res.send(JSON.stringify(booksByTitle,null,4));
  }).catch((err) => {
    return res.status(404).json({message: err});
  }); 

  return;
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
