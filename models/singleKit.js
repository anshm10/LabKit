var mongoose = require("mongoose");

var singleKitSchema = mongoose.Schema({
	name: String,
	availability: String,
	picture: String,
	components: String,
	borrower: String
});

module.exports = mongoose.model("SingleKit", singleKitSchema);