const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground"); //import model from models folder
//connect db
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	// useCreateIndex: true,//default setting in mongoose > 6
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connections error:")); //check if there is an error
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); //joins all views to the root route ('/')

app.get("/", (req, res) => {
	res.render("home");
});
//create new campground
app.get("/makecampground", async (req, res) => {
	const camp = new Campground({
		title: "My backyard",
		description: "cheap camping",
	});
	await camp.save();
	res.send(camp);
});

app.listen(3000, () => {
	console.log(`Serving on port 3000`);
});
