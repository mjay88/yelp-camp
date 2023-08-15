const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground"); //import model from models folder
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
//connect db
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
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

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); //joins all views to the root route ('/')

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
	res.render("home");
});

//campground index
app.get(
	"/campgrounds",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);
//route for serving form for new campground, has to go before details route
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});
//route to post new campground
app.post(
	"/campgrounds",
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//show/details route, order matters
app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/show", { campground });
	})
);

//edit route to serve edit form
app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/edit", { campground });
	})
);
//put route for editting
app.put(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//delete route
app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);

//error handleing
app.use((err, req, res, next) => {
	res.send("OH BOY, SOMETHING WENT WRONG");
});

app.listen(3000, () => {
	console.log(`Serving on port 3000`);
});
