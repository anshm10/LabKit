var express  = require("express");
var router 	 = express.Router();
var passport = require("passport");
var User 	 = require("../models/user");
var Kit      = require("../models/kit");
var async 	 = require("async");
var nodemailer = require("nodemailer");
var crypto   = require("crypto");

//Root Routes
router.get("/", function(req, res) {
	res.render("homepage");
});

router.get("/about", function(req, res) {
	res.render("about")
});

router.get("/contact", function(req, res) {
	res.render("contact")
})


//=======================================================

//AUTH ROUTES

//show the signup form
router.get("/signup", function(req, res) {
	res.render("signup");
});


//handle signup logic
router.post("/signup", function(req, res) {
	var newUser = new User({username: req.body.username, email: req.body.email});
	if(req.body.adminCode === "GMA2020") { // checks if the user is an admin
		newUser.isAdmin = true;// if so, all admin capabilities are unlocked
	}// next, a new user is registered to the database
	User.register(newUser, req.body.password, function(err, user) {
		if(err) { // error message in case user is not registered properly
			req.flash("error", err.message);
			res.redirect("/signup");// signup page is conveniently rendered for user
		}// a passport method, authenticates the user and log them in
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "Welcome to LabKit " + user.username);
			res.redirect("/kits"); 
		}); // ^ once the user is logged in the kits page is rendered
	});
});

//show login form
router.get("/login", function(req, res) {
	res.render("login");// renders the login.ejs in the views directory
});

//handle login logic
router.post("/login", passport.authenticate("local", // this is the middleware
	{
		successRedirect: "/kits", // if the username and password is correct, redirect to /kits
		failureRedirect: "/login" // if the username and password is incorrect, redirect to login
	}), function(req, res) { // callback is not required as the user will get redirected before this is ran
});

//LOGOUT ROUTE

router.get("/logout", function(req, res) {
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/kits")
})



//===========================================================================

//Forgot Password routes

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) { // after the user enters their email
  async.waterfall([// async.waterfall allows an array of functions to be run one after another
    function(done) {// first function generates a token for the user to reset their password
      crypto.randomBytes(20, function(err, buf) {// crypto allows a random token to be created
      	// when it is done a function with buf is executed
        var token = buf.toString('hex');// buf stored in variable token
        done(err, token);// function is complete and executes the next function
      });
    },
    function(token, done) { // the next function checks if the email entered is present in the database
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {// if the email is not registered to any user
          req.flash('error', 'No account with that email address exists.');// error message
          return res.redirect('/forgot');// redirected to the forgot page
        }
        // if the email does exist in the database
        user.resetPasswordToken = token;// the token is stored in the users model
        user.resetPasswordExpires = Date.now() + 3600000; // the token will expire after 1 hour

        user.save(function(err) {// the user model is saved 
          done(err, token, user);// the second function is complete and executes the next function
        });
      });
    },
    function(token, user, done) {// the final function generates the email to be sent
      var smtpTransport = nodemailer.createTransport({// nodemailer is used
        service: 'Gmail', // Gmail is the most popular address used, however extensions can be made
        auth: {
          user: 'labkitdemonstration@gmail.com',
          pass: 'labkitdemonstration123'
        }
      });
      var mailOptions = {
        to: user.email, //users email
        from: 'labkitofficial@gmail.com', // email chosen is simple for the user to understand
        subject: 'LabKit Password Reset', // short & precise title allows users to understand the email from inbox
        text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };// body of the email contains the link of the reset form using the token
      smtpTransport.sendMail(mailOptions, function(err) {// the email has been sent using the variable above
        console.log('mail sent');// for backend programmer to know if the email has been sent
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        // success message is flashed to the user to check their email
        done(err, 'done');// final function is run
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');// if there is no error, redirect to the flash
  });
});



// Reset Password routes
// This route is after the user receives the email and clicks on the link to change their password
router.get('/reset/:token', function(req, res) { // when the user clicks on the email 
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
    // the get request renders a reset page where the user can enter their new password
  });
});

router.post('/reset/:token', function(req, res) {// after the new password is entered
  async.waterfall([ // another array of functions
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {// repeated from before
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }// if no error
        if(req.body.password === req.body.confirm) {// if the first password is equal to the second
          user.setPassword(req.body.password, function(err) {
          // Passport Local Mongoose has a method to set the password with salting and encrypting
            user.resetPasswordToken = undefined;// this is done in case the user wants to reset their
            user.resetPasswordExpires = undefined;// password for a second time

            user.save(function(err) {// saves and updates the user to the database
              req.logIn(user, function(err) {// logs the user into labkit
                done(err, user);// invoke done
              });
            });
          })
        } else {// if the two passwords dont match
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {// this function sends a second confirmation email to the user
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'labkitdemonstration@gmail.com',
          pass: 'labkitdemonstration123'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'labkitofficial@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {// the mail is sent and if there is no error
      	if(err) {
  			console.log(err);
  		} else {
  			req.flash('success', 'Success! Your password has been changed.');// a success message is flashed
	        done(err);
  		}  
      });
    }
  ], function(err) {
  	if(err) {
  		console.log(err);
  	}
    res.redirect('/kits');// finally, if there is no error, redirect to kits
  });
});

module.exports = router;

