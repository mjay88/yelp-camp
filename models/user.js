const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
});
//pass passportLocalMongoose to usershema plugin, automatically adds a field for password, make sure usernames are unique, gives us access to additional methods
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
