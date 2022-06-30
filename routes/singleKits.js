var express   = require("express");
var router 	  = express.Router({mergeParams: true});
var Kit 	  = require("../models/kit");
var SingleKit = require("../models/singleKit");
var middleware = require("../middleware");

//Adding a singleKit
router.get("/kits/:id/singleKits/new", middleware.checkKitOwnership, function(req, res) {
	//find kit by id
	Kit.findById(req.params.id, function(err, kit){
		if(err) {
			console.log(err);
		} else {
			res.render("singleKits/new", {kit: kit});
		}
	})
});


//Logic of adding a singleKit
router.post("/kits/:id/singleKits", middleware.checkKitOwnership, function(req, res) {
	//lookup kit using id
	Kit.findById(req.params.id, function(err, kit){
		if(err) {
			console.log(err);
			res.redirect("/kits")
		} else {
			//create a new singleKit
			SingleKit.create(req.body.singleKit, function(err, singleKit) {
				if(err) {
					console.log(err);
				} else {
					//connect new singleKit to kit
					kit.singleKits.push(singleKit);
					kit.save();
					req.flash("success", "Successfully added a new Single Kit!");
					//redirect to kit's lists page
					res.redirect("/kits/" + kit._id)
				}
			})
		}
	})
});

// SINGLEKIT EDIT ROUTE
router.get("/kits/:id/singleKits/:singleKit_id/edit", middleware.checkKitOwnership, function(req, res) {
	SingleKit.findById(req.params.singleKit_id, function(err, foundsingleKit){
		if(err) {
			res.redirect("/kits");
		} else {
			res.render("singleKits/edit", {kit_id: req.params.id, singleKit: foundsingleKit});
		}
	});
});

// BORROW ROUTE
router.get("/kits/:id/singleKits/:singleKit_id/borrow", middleware.isLoggedIn, middleware.isBorrowed, function(req, res) {
	SingleKit.findById(req.params.singleKit_id, function(err, foundsingleKit){
		if(err) {
			res.redirect("/kits");
		} else {
			res.render("singleKits/borrow", {kit_id: req.params.id, singleKit: foundsingleKit});
		}
	});
});

// SINGLEKIT UPDATE ROUTE
router.put("/kits/:id/singleKits/:singleKit_id", middleware.isLoggedIn, function(req, res) {
	SingleKit.findById(req.params.singleKit_id, function(err, foundsingleKit) {
		if(foundsingleKit.availability === "free" && !req.user.isAdmin) {
			SingleKit.findByIdAndUpdate(req.params.singleKit_id, {availability: 'borrowed', borrower: req.user.username}, function(err, updatedsingleKit) {	
				if(err) {
					res.redirect("/");
				} else {
					req.user.singleKits.push(updatedsingleKit);
					req.user.save();
					req.flash("success", "Successfully borrowed this Single Kit!")
					res.redirect("/kits/" + req.params.id);
				}
			});
		} else {
			SingleKit.findByIdAndUpdate(req.params.singleKit_id, req.body.singleKit, function(err, updatedsingleKit) {	
				if(err) {
					res.redirect("/");
				} else {
					req.flash("success", "Successfully edited Single Kit!")
					res.redirect("/kits/" + req.params.id);
				}
			});
		}
	});
});

// DELETE ROUTE
router.delete("/kits/:id/singleKits/:singleKit_id", middleware.checkKitOwnership, function(req, res) {
	SingleKit.findByIdAndDelete(req.params.singleKit_id, function(err) {
		if(err) {
			res.redirect("back");
		} else {
			req.flash("success", "Successfully deleted Single Kit!!")
			res.redirect("/kits/"  + req.params.id)
		}
	});
});



module.exports = router;

