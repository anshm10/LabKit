var express    = require("express");
var router 	   = express.Router();
var Kit        = require("../models/kit");
var User 	   = require("../models/user");
var middleware = require("../middleware");



//Kits - Shows all the Kits (NXT EV3 VEX)
router.get("/kits", function(req, res) { //this route must access all the kits from the collection kits
	if(req.query.search) { // if the user has entered some search condition
		const regex = new RegExp(escapeRegex(req.query.search), 'gi'); // calls the escapeRegex function
		Kit.find({type: regex}, function(err, allkits) { // the condition is stored in variable regex
			var count = allkits.length;// counts the number of kits in search criteria
			if(err) {
				console.log(err);
			} else {
				if(allkits.length < 1) {// if no kits fulfill the criteria
					req.flash("error", req.query.search + " is not provided by our lab!");
					res.redirect("back");// appropriate error message is used and redirects
				}
				res.render("kits/kits", {kits:allkits, currentUser: req.user, count: count});
				// only the searched kits are sent to /kits
			}
		})
	} else {// if the user has not entered anything, all kits will be displayed
		Kit.find({}, function(err, allkits) {
			var count = allkits.length;// counts all the kits in the database
			if(err) {
				console.log(err);
			} else {
				res.render("kits/kits", {kits:allkits, currentUser: req.user, count: count}); 
				// takes all the kits from the database,the value of the user (including username and _id) 
				//in current use, and passes the count variable which is displayed on screen
			}
		})// end of Kit.find()
	}// end of if
}); // end of get


//CREATE - Adds a new Kit to DB
router.post("/kits", middleware.isLoggedIn, function(req, res) {
	//get data from form and add to kits array
	var company = req.body.company;
	var type = req.body.type;
	var image = req.body.image;
	var desc = req.body.description;
	var newKit = {company: company, type: type, image: image, description: desc};
	//Create a new kit and save to database
	Kit.create(newKit, function(err, newlyCreated) {
		if(err) {
			console.log(err);
		} else {
			req.flash("success", "Successfully added " + newKit.type + " to LabKit");
			//redirect back to kits page
			res.redirect("/kits");//this will run the above route and find all ckits
		}
	});
});

// ALL BORROWED KITS ROUTE
router.get("/kits/borrowedkits", function(req, res) {
	Kit.find({}).populate("reviews").populate("singleKits").exec(function(err, foundKit) {
		if(err) {
			console.log(err);
		} else {		
			res.render("kits/borrowedkits", {kit: foundKit});
		}
	});
});


// NEW - Show form to create new kit
router.get("/kits/new", middleware.checkKitOwnership, function(req, res) { // Can only add a kit if you're an admin
	res.render("kits/new");
});

// kits/new must be declared before kits/:id as it overrides the second route

//SHOW TEMPLATE/ LISTS TEMPLATE
router.get("/kits/:id", function(req, res) { // Anyone can go to the showpage
	//find the kit with provided 
	Kit.findById(req.params.id).populate("reviews").populate("singleKits").exec(function(err, foundKit) {
		var count2 = foundKit.singleKits.length;
		if(err) {
			console.log(err);
		} else {
			// console.log(foundKit);
			//render show template with that kit
			res.render("kits/lists", {kit: foundKit, count2: count2});
		}
	});
});



//EDIT KIT ROUTE
router.get("/kits/:id/edit", middleware.checkKitOwnership, function(req, res) { // The user must be admin
	Kit.findById(req.params.id, function(err, foundKit) {
		res.render("kits/edit", {kit: foundKit})
	});	
});

			

//UPDATE KIT ROUTE
router.put("/kits/:id", middleware.checkKitOwnership, function(req,res) {//put request also has checkKitOwnership as we want to protect the put as well incase someone used postman
	//find and update the correct kit
	Kit.findByIdAndUpdate(req.params.id, req.body.kit, function(err, updatedKit) {
		if(err) {
			res.redirect("/kits");
		} else {
			req.flash("success", "Successfully updated this Kit!");
			res.redirect("/kits/" + req.params.id);
		}
	});
});

// DESTROY KIT ROUTE
router.delete("/kits/:id", middleware.checkKitOwnership, function(req, res) {
	Kit.findByIdAndDelete(req.params.id, function(err) {
		if(err) {
			res.redirect("/kits")
		} else {
			req.flash("success", "Successfully deleted this Kit!");
			res.redirect("/kits")
		}
	})
});

function escapeRegex(text) { // receieves the search query
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;


