var mongoose = require("mongoose");

var kitSchema = new mongoose.Schema({
	company: String,
	type: String,
	image: String,
	description: String,
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
	singleKits: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "SingleKit"
		}
	]
});

module.exports = mongoose.model("Kit", kitSchema);