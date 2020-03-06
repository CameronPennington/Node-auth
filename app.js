const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

const myVars = {
	domain: "penncoffee.auth0.com",
	clientID: "fdrxy9ifrbgoaiHhrRGcXczaHd3oKoT4",
	clientSecret:
		"yLMtUmc9yPuTc_7tifnrHX5LZp19zdStmF7jqHvwpUtD0IL3VNQUgjLd_geahybh",
	callbackURL: "http://localhost:3000/callback"
};

const strategy = new Auth0Strategy(myVars, function(
	accessToken,
	refreshToken,
	extraParam,
	profile,
	done
) {
	return done(null, profile);
});

passport.use(strategy);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
	session({ secret: "baby_carina", resave: true, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.loggedIn = false;
	if (req.session.passport && typeof req.session.passport.user != "undefined") {
		res.locals.loggedIn = true;
	}
	next();
});

app.get("/", function(req, res, next) {
	res.render("index");
});

app.get(
	"/login",
	passport.authenticate("auth0", {
		clientID: myVars.clientID,
		domain: myVars.domain,
		redirectUri: myVars.callbackURL,
		responseType: "code",
		audience: "https://penncoffee.auth0.com/userinfo",
		scope: "openid profile"
	}),
	function(req, res) {
		res.redirect("/");
	}
);

app.get("/logout", function(req, res) {
	res.logout();
	res.redirect("/");
});

app.get(
	"/callback",
	passport.authenticate("auth0", {
		failureRedirect: "/failure"
	}),
	function(req, res) {
		res.redirect("/user");
	}
);

app.get("/user", function(req, res, next) {
	res.render("user", {
		user: req.user
	});
});

app.get("/failure", function(req, res, next) {
	res.render("failure");
});

app.listen(3000, function() {
	console.log("Server is running on port 3000");
});
