if (process.env.NODE_ENV !== "production") {
	//if we are in development, require the dotenv package, require the dotenv file
	require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const app = express();

//connect db
mongoose.connect("mongodb://localhost:27017/yelp-camp2", {
	useNewUrlParser: true,
	// useCreateIndex: true,//default setting in mongoose > 6
	useUnifiedTopology: true,
});
//testing gitignore
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connections error:")); //check if there is an error
db.once("open", () => {
	console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
//
app.set("views", path.join(__dirname, "views")); //joins all views to the root route ('/')

const sessionConfig = {
	secret: "thisshouldbeabettersecret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
//this must go after app.use(session(sessionConfig));
app.use(passport.session());
//authenticate is coming from passport local mongoose
passport.use(new LocalStrategy(User.authenticate()));

app.use(mongoSanitize());

passport.serializeUser(User.serializeUser()); //how we store a user in the session
passport.deserializeUser(User.deserializeUser());

//middleware that gives us automatic access to flash message in all our templates so we don't have to pass it manuelly
app.use((req, res, next) => {
	console.log(res.locals, "res.locals here");
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//  configure the server to respond to any request under the public folder with that resource if found.
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static("public"));
app.use(morgan("tiny"));

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
	res.render("home");
});

//error handleing
app.all("*", (req, res, next) => {
	next(new ExpressError("PAGE NOT FOUND", 404));
});
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh no, something went wrong";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log(`Serving on port 3000`);
});
