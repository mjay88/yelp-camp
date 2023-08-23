const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	fileName: String,
});
ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200,h_200");
});
const CampGroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	//refernce reviews
	reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
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
