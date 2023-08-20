const express = require("express");
//since routers are seperate local variables we don't have access to the params from app.js, so set mergeParams to true
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground"); //import model from models folder
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

//post for reviews
router.post(
	"/",
	isLoggedIn,
	validateReview, //server side validation w/Joi
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
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
	isLoggedIn,
	isReviewAuthor,
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
