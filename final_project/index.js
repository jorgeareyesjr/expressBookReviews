const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",
	session({
		secret: "fingerprint_customer",
		resave: true,
		saveUninitialized: true,
	}),
);

// Middleware which tells that the user is authenticated or not.
app.use("/customer/auth/*", function auth(req, res, next) {
	// Get the authorization object stored in the session.
	if (req.session.authorization) {
		// Get access token from session.
		let token = req.session.authorization['accessToken'];

		// Verify the token.
		jwt.verify(token, "access-secret", (err, user) => {
			if(!err){
				req.user = user;
				next();
			} else {
				return res.status(403).json({ message: "User is not authenticated." });
			};
		});
	} else {
		return res.status(403).json({ message: "User is not logged in." });
	};
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,() => console.log("Server is running"));
