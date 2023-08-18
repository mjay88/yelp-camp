const express = require("express");
//since routers are seperate local variables we don't have access to the params from app.js, so set mergeParams to true
const router = express.Router({ mergeParams: true });
const { reviewSchema } = require("../schemas.js");
const Review = require("../models/review");
const Campground = require("../models/campground"); //import model from models folder
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

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

//post for reviews
router.post(
	"/",
	validateReview, //server side validation w/Joi
	catchAsync(async (req, res) => {
		console.log(req.params);
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash("success", "Successfully added your review!!!");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//delete route for reviews, remove reference to reveiw in campground and remove the review itself
router.delete(
	"/:reviewId",
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongo operator $pull removes from an existing array all instances of a value or values that match a specified condition
		//findByIdAndDelete triggers mongoose middleware!!! see campground.js/campgroundSchema!!!
		await Review.findByIdAndDelete(req.params.reviewId);
		req.flash("success", "Successfully deleted your review!!!");
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
