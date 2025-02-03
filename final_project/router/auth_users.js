const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let foundUsers = users.filter((user)=> user.username === username && user.password === password);
  if (foundUsers) {
    if (foundUsers.length>0) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // check username and password are provided
  if (!username || !password) {
    return res.status(404).json({message:"Error in login"});
  }

  //authenticate the user
  if (authenticatedUser(username,password)){
    let accessToken = jwt.sign({
      data:password
    }, 'access',{expiresIn:60*60});

    req.session.authorization = {accessToken,username};

    return res.status(200).json({message:"User logged in"});
  }

  return res.status(404).json({message: "Error in login"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.body.review;
  let user = req.session.authorization.username;

  if (books[isbn]) {
    if (review) {
      if (!books[isbn].reviews) {
        books[isbn].reviews = [];
      }
      let existingReview = books[isbn].reviews.find(r => r.reviewer === user);
      if (existingReview) {
        existingReview.review = review;
        return res.status(200).json({message: "Review updated successfully"});
      } else {
        books[isbn].reviews.push({reviewer: user, review: review});
        return res.status(200).json({message: "Review added successfully"});
      }
    } else {
      return res.status(400).json({message: "Review is required"});
    }
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let user = req.session.authorization.username;

  if (books[isbn]) {
    let existingReview = books[isbn].reviews.find(r => r.reviewer === user);
    if (existingReview) {
      books[isbn].reviews = books[isbn].reviews.filter(r => r.reviewer !== user);
      return res.status(200).json({message: "Review deleted successfully"});
    } else {
      return res.status(404).json({message: "Review not found"});
    }
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
