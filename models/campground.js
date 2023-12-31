const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	fileName: String,
});
//virtuals from mongoose
ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200,h_200");
});

const opts = { toJSON: { virtuals: true } };

const CampGroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String, // Don't do `{ location: { type: String } }`
				enum: ["Point"], // 'location.type' must be 'Point'
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		//refernce reviews
		reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
		//reference popUpMarkup virtual
		// properties: {
		// 	popUpMarkup: "<h3></h3>",
		// },
	},
	opts
);
//virtual from mongoose
CampGroundSchema.virtual("properties.popUpMarkup").get(function () {
	return `<strong><a href="/campgrounds/${
		this._id
	}">${this.title}</a></strong><br><p>${this.description.substring(0, 30)}...</p>`;
});

//mongoose middleware
CampGroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		//doc is the campground, which has reviews, we are going to delete any review whos id field is $in our doc's reviews array
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model("Campground", CampGroundSchema);
