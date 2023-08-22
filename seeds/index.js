const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground"); //import model from models folder
//connect db
mongoose.connect("mongodb://localhost:27017/yelp-camp2", {
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

const sample = (array) => {
	return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: "64e284443a0e04be63356956",
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url: "https://res.cloudinary.com/dqlkngbnx/image/upload/v1692739310/YelpCamp/bgzaa3dkbj42cig1voau.jpg",
					fileName: "YelpCamp/bgzaa3dkbj42cig1voau",
				},
				{
					url: "https://res.cloudinary.com/dqlkngbnx/image/upload/v1692739313/YelpCamp/auqtx7zprzfunn2m6tum.jpg",
					fileName: "YelpCamp/auqtx7zprzfunn2m6tum",
				},
				{
					url: "https://res.cloudinary.com/dqlkngbnx/image/upload/v1692739323/YelpCamp/j5ps8wcgbbc2jt57zfoe.jpg",
					fileName: "YelpCamp/j5ps8wcgbbc2jt57zfoe",
				},
			],
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta eos quam dignissimos id quod, quos ex, tempore et a rem beatae eligendi, sapiente dolores consectetur modi at quaerat molestiae delectus.",
			price: price,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
