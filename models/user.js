var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: String,
	email: {type: String, unique: true, required: true},
	resetPasswordToken: String,
    resetPasswordExpires: Date,
    singleKits: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "SingleKit"
		}
	],
	isAdmin: {type: Boolean, default: false}
});
// the email and username are made unique so the same email
// and username cannot be repeated

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);

/*when there is no user defined i.e. when you are logged out, req.user is UNDEFINED but once you log in 
the user data (excluding the password) is put in req.user.
This can be used when you want to implement admin authentication, stick in a boolean value declaring whether
the account being accessed is an admin (like a secret code) and then display buttons and actions accordingly
The boolean value will be stored in req.body.isAdmin*/