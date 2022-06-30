// Requiring the Packages
var express 	   = require("express"),
	app 		   = express(),
	bodyParser 	   = require("body-parser"),
	mongoose 	   = require("mongoose"),
	flash 	   	   = require("connect-flash"),
	passport 	   = require("passport"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	Kit 		   = require("./models/kit"),
	Review 		   = require("./models/review"),
	SingleKit 	   = require("./models/singleKit"),
	User 		   = require("./models/user"),
	seedDB		   = require("./seeds");


// Requiring the Routes
var kitRoutes 		= require("./routes/kits"),
	singleKitRoutes = require("./routes/singleKits"),
	reviewRoutes 	= require("./routes/reviews"),
	authRoutes 		= require("./routes/auth");


mongoose.connect("mongodb://localhost/labkit", {useNewUrlParser: true, useUnifiedTopology: true});// Connecting the application to database
mongoose.set('useFindAndModify', false);// To prevent depreciation warnings when using findByIdAndUpdate/Delete
app.use(bodyParser.urlencoded({extended: true}));//Tells express to use bodyParser
app.set("view engine", "ejs");// Tells express to use ejs package so we do not have to specify whenever requiring files from the views directory
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());// Tells express to use connect-flash for the flash messages
// seedDB(); Runs the seedDB file from seeds.js to feed the database

app.locals.moment = require('moment');

// Passport Configuration
app.use(require("express-session")({
	secret: "LabKit secret", // Can be anything, is used to decode the information in the setting
	resave: false, // Two other things that are required
	saveUninitialized: false // If not defined as false then an error will occur on the console

})); // Tells express to require express-session and use with some options

app.use(passport.initialize()); // Setting passport up
app.use(passport.session()); // Setting passport up
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // They are responsible for taking the data from the session and reading it
passport.deserializeUser(User.deserializeUser()); // Then putting it back in the session

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error 	   = req.flash("error")
	res.locals.success 	   = req.flash("success")
	next();//moves on to the next code since this is a middleware and might hang the running of the server
}); //WE need currentUser on ever route, but instead of adding the statement we did on the /kits page, we
	//write this middleware to help

// Using all the Routes
app.use(authRoutes);
app.use(reviewRoutes);
app.use(kitRoutes);
app.use(singleKitRoutes);




// Telling the app to start the server on localhost:3000
app.listen(3000, function(){
	console.log("LabKit Server Has Started!");
});