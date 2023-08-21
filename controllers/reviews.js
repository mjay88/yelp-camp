const Review = require("../models/review");
const Campground = require("../models/campground"); //import model from models folder

module.exports.createReview = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash("success", "Created new review!");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongo operator $pull removes from an existing array all instances of a value or values that match a specified condition
	//findByIdAndDelete triggers mongoose middleware!!! see campground.js/campgroundSchema!!!
	await Review.findByIdAndDelete(req.params.reviewId);
	req.flash("success", "Successfully deleted your review!!!");
	res.redirect(`/campgrounds/${id}`);
};
