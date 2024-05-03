const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const usernameDoesExist = (username) => {
	// Check if the username already exists in the records.
	const existingMatchingUsernames = users.filter(user => user.username === username);
	const usernameDetected = existingMatchingUsernames.length > 0;

	return !usernameDetected ? false : true;
};

const userIsAuthenticated = (username, password) => {
	// Check if username and password match the one we have in records.
	const authenticatedUser = users.filter((user) => {
		return (user.username === username && user.password === password);
	});
	const userIsAuthenticated = authenticatedUser.length > 0;

	return !userIsAuthenticated ? false : true;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
	// Task #7: Complete the code for logging in as a registered user.
	const { username, password } = req.query;

	if (!username || !password) {
		return res.status(404).json({ message: "Error logging in" });
	};

	const authenticatedUser = userIsAuthenticated(username, password);

	if (!authenticatedUser) {
		return res.status(208).json({ message: "Invalid Login. Check username and password" });
	};

	const user = { username, password };

	// Create a JWT token.
	const accessToken = jwt.sign({
		data: user
	}, 'access-secret', { expiresIn: 60 * 60 });

	// Save the token in the session.
	req.session.authorization = { accessToken };

	const matchedUsernames = users.filter((user) => {
		return (user.username === username && user.password === password);
	});

	const currentUser = matchedUsernames[0];

	// Track user login status.
	if (!currentUser.loggedIn) {
		currentUser.loggedIn = true;
		return res.status(200).send("User successfully logged in");
	} else {
		return res.status(200).send("User is already logged in");
	};
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	// Task #8: Complete the code for adding or modifying a book review.
	const isbn = parseInt(req.params.isbn);

	if (isNaN(isbn)) {
		return res.send("Not a valid isbn.");
	};

	const targetBook = books[isbn];

	if (!targetBook) {
		res.send("Book not found.");
	};

	const { username } = req.query;

	const registeredUsernames = users.filter(user => user.username === username);
	const userIsRegistered = registeredUsernames.length > 0;
	const currentUser = registeredUsernames[0];

	if (!userIsRegistered) {
		return res.send('Please register to post a book review.')
	};

	if (!currentUser.loggedIn) {
		return res.send('Please login to post a book review.')
	};

	const review = req.query.review;
	const { reviews } = targetBook;

	// Add the current username's review to the book's `reviews`.
	// Use the current logged in username as a key, to store the review.
	// This way, we can ensure:
	// 1.) Only 1 review is added per user.
	// 2.) If the same user posts a different review on the same ISBN, it should modify the existing review.
	// 3.) If another user logs in and posts a review on the same ISBN, it will get added as a different review.
	reviews[username] = review;

	res.send(`${ username } added a new book review!`)
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
	// Task# 9: Complete the code for deleting a book review.
	const isbn = parseInt(req.params.isbn);

	if (isNaN(isbn)) {
		return res.send("Not a valid isbn.");
	};

	const targetBook = books[isbn];

	if (!targetBook) {
		res.send("Book not found.");
	};

	const { username } = req.query;

	const registeredUsernames = users.filter(user => user.username === username);
	const userIsRegistered = registeredUsernames.length > 0;
	const currentUser = registeredUsernames[0];

	if (!userIsRegistered) {
		return res.send('Please register to delete a book review.')
	};

	if (!currentUser.loggedIn) {
		return res.send('Please login to delete a book review.')
	};

	const { reviews } = targetBook;

	if (!reviews[username]) {
		res.send(`${ username } has no book reviews to delete.`);
	} else {
		// Delete the reviews based on the session username, so that a user can delete only his/her reviews and any not other users'.
		delete targetBook.reviews[username];
	
		res.send(`Deleted ${ username }'s book reviews.`);
	};
});

module.exports.authenticated = regd_users;
module.exports.usernameDoesExist = usernameDoesExist;
module.exports.users = users;
