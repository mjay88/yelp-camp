const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground"); //import model from models folder
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

//campground index
router.get(
	"/",
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);
//route for serving form for new campground, has to go before details route
router.get("/new", isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});
//route to post new campground
router.post(
	"/",
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash("success", "Successfully made a new campground!");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//show/details route, order matters
router.get(
	"/:id",
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path: "reviews",
				populate: {
					path: "author",
				},
			})
			.populate("author");
		console.log(campground);
		if (!campground) {
			req.flash("error", "Cannot find that campground!");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/show", { campground });
	})
);

//edit route to serve edit form
router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);
		if (!campground) {
			req.flash("error", "Cannot find that campground");
			return res.redirect("/campgrounds");
		}

		res.render("campgrounds/edit", { campground });
	})
);
//put route for editting
router.put(
	"/:id",
	isLoggedIn,
	isAuthor,
	validateCampground, //server side validation w/Joi
	catchAsync(async (req, res) => {
		const { id } = req.params;

		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash("success", "Succesfully updated campground");
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//delete route
router.delete(
	"/:id",
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash("success", "Successfully deleted your campground!!!");

		res.redirect("/campgrounds");
	})
);

module.exports = router;
