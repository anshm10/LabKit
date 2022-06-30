var Kit 	  = require("../models/kit");
var Review 	  = require("../models/review");
var SingleKit = require("../models/singleKit");


//all the middleware goes here

/*Middleware: Use -> to check if the user is loged in, can be put on the get request of any route and 
when the route is called the server checks if the user is logged in, if not then it redirects to the 
login screen*/ 


var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");// sends the message
	res.redirect("/login");
}




middlewareObj.checkKitOwnership = function(req, res, next) {
	if(req.isAuthenticated()) { // Checks if the user is logged in
			Kit.findById(req.params.id, function(err, foundKit) { // If the user is logged in, find the id of the kit
				if(err) {
					req.flash("error", "Something went wrong! Try Again!"); // Usually occurs when the database isn't connected or otherwise
					res.redirect("back");
				} else {
					if(req.user.isAdmin) { // If the isAdmin === true
						next(); // Continue with the next code
					}	else { // If the current logged in user is not admin
						req.flash("error", "You are not an Admin. You do not have permission to do that!");
						res.redirect("/kits");
					}
				}
			});
	} else { // If the user is not logged in
		req.flash("error", "You must log in to do that!")
		res.redirect("/login");
	}
}

middlewareObj.checkReviewOwnership = function(req, res, next) {
	if(req.isAuthenticated()) { // Checks if the user is logged in
			Review.findById(req.params.review_id, function(err, foundReview) { // find the id of the review
				if(err) { // if some issue occurs with accessing the database (very unlikely)
					req.flash("error", "Something went wrong! Try Again!");
					res.redirect("back");
				} else { // once the correct review is found from the database
					if((foundReview.author.id.equals(req.user._id))||req.user.isAdmin) { 
					// If the id of the user matches the id of the author of the review
						next(); // Continue with the next code (the rest of the function of the route)
					}	else { // If any other user is trying to edit or delete that comment
						req.flash("error", "You are not the owner of that review. You do not have permission to edit it!");
						res.redirect("back");
					}
				}
			});
	} else { // If the user is not logged in
		req.flash("error", "You must log in to do that!");
		res.redirect("/login");
	}
}

middlewareObj.isBorrowed = function(req, res, next) {
	SingleKit.findById(req.params.singleKit_id, function(err, foundsingleKit){ // checks for the correct single kit
		if(err) {
			res.redirect("/kits");
		} else {
			if(foundsingleKit.availability === "free") {// if the single kit is free
				return next();// continue with the rest of the code
			} else {// if the single kit is already borrowed
				req.flash("error", "That Kit is already borrowed! Please borrow a kit that is free.");
				res.redirect("back");
			}
		}
	});
}

module.exports = middlewareObj;