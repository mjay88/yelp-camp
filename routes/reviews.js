const express = require("express");
//since routers are seperate local variables we don't have access to the params from app.js, so set mergeParams to true
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviews = require("../controllers/reviews");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

//post for reviews
router.post(
	"/",
	isLoggedIn,
	validateReview, //server side validation w/ joi
	catchAsync(reviews.createReview)
);

//delete route for reviews, remove reference to reveiw in campground and remove the review itself
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
