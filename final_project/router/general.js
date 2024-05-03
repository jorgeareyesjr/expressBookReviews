const express = require('express');
let books = require("./booksdb.js");
let usernameDoesExist = require("./auth_users.js").usernameDoesExist;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	// Task #6: Complete the code for registering a new user.
	const { username, password } = req.query;

	if (!username || !password) {
		return res.status(404).json({ message: "Error registering user" });
	};

	// If the username does not exist, add the user to the records.
	if (!usernameDoesExist(username)) {
		users.push({
			"username": username,
			"password":password,
			"loggedIn": false,
		});

		return res.status(200).json({ message: "User successfully registered! Please log in to continue." });
	};

	// If the username already exists, return an error message.
	return res.status(404).json({ message: "User already exists!" });
});

// Get the book list available in the shop
public_users.get('/', function (_req, res) {
	// Task #1: Complete the code for getting the list of books available in the shop.
	// Task #10: Add the code for getting the list of books available in the shop (done in Task 1) using Promise callbacks.

	// Create the promise.
	const promiseToGetAllBooks = new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				const allBooks = books;
				resolve(allBooks);
			}, 250);
		} catch (error) {
			reject(error);
		};
	});

	// Call the promise and wait for it to be resolved.
	promiseToGetAllBooks.then(
		(promisedBooks) => res.send(JSON.stringify(promisedBooks)),
		(error) => res.send(error),
	);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
	// Task #2: Complete the code for getting the book details based on ISBN.
	// Task #11: Add the code for getting the book details based on ISBN (done in Task 2) using Promise callbacks.
	const isbn = parseInt(req.params.isbn);

	if (isNaN(isbn)) {
		return res.send("Not a valid book isbn.");
	};

	// Create the promise.
	const promiseToGetBookByISBN = new Promise((resolve, reject) => {
		try {
			setTimeout(() => {
				const targetedBook = books[isbn];
				resolve(targetedBook);
			}, 250);
		} catch (error) {
			reject(error);
		};
	});

	// Call the promise and wait for it to be resolved.
	promiseToGetBookByISBN.then(
		(promisedBook) => {
			return !promisedBook
				? res.send(`No book found with isbn: ${isbn}`)
				: res.send(JSON.stringify(promisedBook));
		},
		(error) => res.send(error),
	);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
	// Task #3: Complete the code for getting the book details based on the author.
	// Task #12: Add the code for getting the book details based on Author (done in Task 3) using Promise callbacks.
	const { author } = req.params;

	// Create the promise.
	const promiseToGetBookByAuthor = new Promise((resolve, reject) => {
		try {
			const allBookValues = Object.values(books);
			const booksByAuthor = allBookValues.filter(book => book.author === author);

			setTimeout(() => {
				resolve(booksByAuthor);
			}, 250);
		} catch (error) {
			reject(error);
		};
	});

	// Call the promise and wait for it to be resolved.
	promiseToGetBookByAuthor.then(
		(promisedBooks) => {
			const booksExist = promisedBooks.length > 0;

			return !booksExist
				? res.send(`${author} has no books.`)
				: res.send(JSON.stringify(promisedBooks));
		},
		(error) => res.send(error),
	);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	// Task #4: Complete the code for getting the book details based on the title.
	// Task #13: Add the code for getting the book details based on Title (done in Task 4) using Promise callbacks.
	const { title } = req.params;

	// Create the promise.
	const promiseToGetBooksByTitle = new Promise((resolve, reject) => {
		try {
			const allBookValues = Object.values(books);
			const booksFilteredByTitle = allBookValues.filter(book => book.title === title);

			setTimeout(() => {
				resolve(booksFilteredByTitle);
			}, 250);
		} catch (error) {
			reject(error);
		};
	});

	// Call the promise and wait for it to be resolved.
	promiseToGetBooksByTitle.then(
		(promisedBooks) => {
			const booksExist = promisedBooks.length > 0;

			return !booksExist
				? res.send(`No books match the title: ${ title }.`)
				: res.send(JSON.stringify(promisedBooks));
		},
		(error) => res.send(error),
	);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
	// Task #5: Complete the code for getting book reviews by isbn.
	const isbn = parseInt(req.params.isbn);
	const targetedBook = books[isbn];

	if (isNaN(isbn)) {
		return res.send("Not a valid isbn.");
	};
	
	if (!targetedBook) {
		return res.send(`No book reviews found with this isbn: ${isbn}`);
	};

	return res.send(JSON.stringify(targetedBook.reviews));
});

// Get all users.
public_users.get('/users', function (_req, res) {
	return res.send(JSON.stringify(users));
});

module.exports.general = public_users;
