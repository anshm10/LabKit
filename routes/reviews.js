var express   = require("express");
var router 	  = express.Router({mergeParams: true});
var Kit 	  = require("../models/kit");
var Review 	  = require("../models/review");
var middleware = require("../middleware");

//Adding a Review
router.get("/kits/:id/reviews/new", middleware.isLoggedIn, function(req, res){
	//find kit by id
	Kit.findById(req.params.id, function(err, kit){
		if(err) {
			console.log(err);
		} else {
			res.render("reviews/new", {kit: kit});
		}
	})
});


//Logic of adding a review
router.post("/kits/:id/reviews", middleware.isLoggedIn, function(req, res) { //checks if the user is logged in as well
	//lookup kit using id
	Kit.findById(req.params.id, function(err, kit){
		if(err) {
			console.log(err);
			res.redirect("/kits")
		} else {
			//create a new review
			Review.create(req.body.review, function(err, review) {
				if(err) {
					req.flash("error", "Something went wrong!");
					cosole.log(err);
				} else {
					//add username and id to review
					review.author.id = req.user._id;
					review.author.username = req.user.username;
					//save comment
					review.save();
					//connect new review to kit
					kit.reviews.push(review);
					kit.save();
					req.flash("success", "Successfully added your review!")
					//redirect to kit's lists page
					res.redirect("/kits/" + kit._id)
				}
			})
			
		}
	})
});



// REVIEW EDIT ROUTE
router.get("/kits/:id/reviews/:review_id/edit", middleware.checkReviewOwnership, function(req, res) {
	Review.findById(req.params.review_id, function(err, foundReview){
		if(err) {
			res.redirect("/kits");
		} else {
			res.render("reviews/edit", {kit_id: req.params.id, review: foundReview});
		}
	});
});

// REVIEW UPDATE ROUTE
router.put("/kits/:id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res) {
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, function(err, updatedReview) {	
		if(err) {
			res.redirect("/");
		} else {
			req.flash("success", "Successfully edited your review!")
			res.redirect("/kits/" + req.params.id);
		}
	});
});

// DELETE ROUTE
router.delete("/kits/:id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res) {
	Review.findByIdAndDelete(req.params.review_id, function(err) {
		if(err) {
			res.redirect("back");
		} else {
			req.flash("success", "Successfully deleted your review!")
			res.redirect("/kits/"  + req.params.id)
		}
	});
});


module.exports = router;

