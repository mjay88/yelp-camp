const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const methodOverride = require("method-override");
const Campground = require("./models/campground"); //import model from models folder
const Review = require("./models/review");
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

//server side validation with Joi, see schemas.js
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//server side validation with Joi, see schemas.js
const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	console.log(error, "review error");
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
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
	validateCampground,
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
		const campground = await Campground.findById(req.params.id).populate(
			"reviews"
		);
		console.log(campground);
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
	validateCampground, //server side validation w/Joi
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

//post for reviews
app.post(
	"/campgrounds/:id/reviews",
	validateReview, //server side validation w/Joi
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//delete route for reviews, remove reference to reveiw in campground and remove the review itself
app.delete(
	"/campgrounds/:id/reviews/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongo operator $pull removes from an existing array all instances of a value or values that match a specified condition
		//findByIdAndDelete triggers mongoose middleware!!! see campground.js/campgroundSchema!!!
		await Review.findByIdAndDelete(req.params.reviewId);
		res.redirect(`/campgrounds/${id}`);
	})
);

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
