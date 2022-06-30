/* The seeds file is used for removing all the kits from the database and then adding the 3 ones from
the data[].  */

var mongoose  = require("mongoose"),
	Kit 	  = require("./models/kit"),
	Review	  = require("./models/review"),
	SingleKit = require("./models/singleKit");


var data = [
	{
		company: "LEGO",
		type: "NXT",
		image: "https://www.robot-advance.com/EN/ori-lego-mindstorms-nxt-kit-education-438.jpg",
		description: "The NXT kit is the original LEGO Mindstorms Kit"
	},
	{
		company: "LEGO",
		type: "EV3",
		image: "https://www.robot-advance.com/EN/ori-45544-ev3-core-set-1568.jpg",
		description: "The EV3 Lego kit is the updated version of the NXT kit"
	},
	{
		company: "VEX",
		type: "VEX",
		image: "https://www.vexrobotics.com/media/catalog/product/cache/4/image/9df78eab33525d08d6e5fb8d27136e95/2/2/228-2531.jpg",
		description: "The VEX kit is for more advanced users with more sophisticated pieces"
	}
]; // Example data, each one is an object which our model expects


function seedDB(){
	// Must remove all kits
	Kit.deleteMany({}, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("removed kits");
		}
	// Now must add a few kits
		data.forEach(function(seed) {
			Kit.create(seed, function(err, kit) {
				if(err) {
					console.log(err);
				} else { // Once we create the kit, we need to add a set and a review to that kit
					console.log("Added a new kit");

					// First lets create a review
					Review.create(
					{
						text:"Hi again, its me.",
						author: "Simon"
					}, function(err, review){
						if(err) {
							console.log(err);
						} else {
							kit.reviews.push(review);
							// kit.save();
							console.log("Created new review")
						}
					});

					// Now lets create a single kit
					SingleKit.create(
					{
						name: "00001",
						availability: "free",
						picture: "https://ipdl.gatech.edu/seed/images/productImages/LegoMindstorm.jpg",
						components: "Contains most pieces, missing few wheels"
					}, function(err, singleKit){
						if(err) {
							console.log(err)
						} else {
							kit.singleKits.push(singleKit);
							kit.save();
							console.log("Added a new single kit")
						}
					});
				} // End of else
			}); // End of create()
		}); // End of forEach
	}); // End of deleteMany()
} // End of seed function

module.exports = seedDB;