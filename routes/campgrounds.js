const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
// const campground = require("../models/campground");

//restructure with express router.route
router
	.route("/") //campground index
	.get(catchAsync(campgrounds.index))
	//route to post new campground
	.post(
		isLoggedIn,
		upload.array("image"),
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);

//route for serving form for new campground, has to go before details/show route
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
	.route("/:id")
	.get(catchAsync(campgrounds.showCampground)) //show/details route, order matters
	.put(
		//put route for editting
		isLoggedIn,
		isAuthor,
		validateCampground, //server side validation w/Joi
		catchAsync(campgrounds.updateCampground)
	)
	.delete(
		//delete route
		isLoggedIn,
		isAuthor,
		catchAsync(campgrounds.deleteCampground)
	);

//edit route to serve edit form
router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
