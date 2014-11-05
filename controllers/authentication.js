var passport = require('passport');

var BookLover = require('../models/bookLovers.js');

var sanitizer = require('sanitizer');

// Function that logs in user after authentication
var performLogin = function(req, res, next, user) {
	req.login(user, function(err) {
		if(err) return next(err);

		// Render logged-in page, if successful
		console.log('performLogin -- successful')
		var userUrl = user.userName;
		console.log('userUrl: ', userUrl)
		return res.redirect('/loggedin/' + userUrl);
	});
};

var authenticationController = {
	// Currently not using login, using processLogin instead
	/*login: function(req,res) {
		console.log('authenticationController.login method called');
		req.flash('error', 'Error signing in. Please try again.');
		// If error in login, redirect to index with error displayed
		res.redirect('index', {
			error: req.flash('error')
		});
	},*/
	processLogin: function(req,res,next) {
		
		var authFunction = passport.authenticate('local', function(err, user, info) {
			console.log('processLogin authFunction info: ', info)
			if(err) { 
				console.log('error in processLogin')
				req.flash('error', 'Sign in is invalid. Please try again.');
				res.render('index', {error: req.flash('error')});
				// return next(err);
			}
			if(!user) {
				console.log('authentication error triggered')
				req.flash('error', info.message + 'Please try again.');
				return res.render('index', {error: req.flash('error')});
			}
			performLogin(req,res,next,user);
		});
		// Call the authFunction just created
		authFunction(req, res, next);
	},
	checkUserNameUnique: function(req,res) {
		var userNameCheck = sanitizer.escape(req.body.userName);
		// Make sure user name contains non-url-safe characters
		if (userNameCheck !== encodeURIComponent(userNameCheck)) {
   		res.status(403).json({
   			invalidChars: true
   		});
   		return;
  		}

  		// Check database for duplicate user name
		var duplicateUserName = false;
		BookLover.findOne({userName: userNameCheck}, {userName: true }, function(err,result) {
			console.log('checkUserNameUnique result: ', result);
			if(result) duplicateUserName = true;
			// If duplicate found send error message
			if(duplicateUserName) {
				res.status(403).json({
					isTaken: true
				});
				return;
			}
			res.status(200).end();
		});
	},

	processSignup: function(req,res,next) {
		// First, validate input from new user
		// Note, duplicate userName is checked for before form is submitted
		var userName = req.param('userName');
		var email = req.param('email');
		var password = req.param('password');

		var error = null;
		var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

		if (!userName || !email || !password) {
  			error = 'All fields are required';
		} else if (userName !== encodeURIComponent(userName)) {
  			error = 'Username contains characters not allowed. Please revise.';
		} else if (!email.match(EMAIL_REGEXP)) {
  			error = 'Email is invalid';
		}

		if (error) {
			req.flash('error', error);
			res.status(403);
			res.render('index', {
				error: req.flash('error')
			});
		}
		// If no error, create new user and save to database
		// Note: See duplicate user check via unique field on email
		if (!error) {
			var bookLover = new BookLover({
				userName: userName,
				email: email,
				password: password
			});

			// Now, try to save new bookLover to the database and have 
			// mongoose give us an error if they already exist
			bookLover.save(function(err, bookLover){
				if(err) {
					var errorMessage = 'An error occured. Please try to sign up again.';

					// this is the duplicate key error, meaning a 'unique' field
					// is a duplicate
					if(err.code === 11000) {
						errorMessage = 'Sorry, this user already exists.';
					}
					// Flash a message and redirect to index and show error
					req.flash('error', errorMessage);
					return res.render('index', {
						error: req.flash('error'),
					});
				}
				// Go ahead and login in the new user
				performLogin(req,res,next,bookLover);
			});
		}
	},

	logout: function(req,res) {
		// Passport injects the logout method for us to call
		console.log("logout function called")
		req.logout();
		req.flash('message', 'You have successfully logged out. Please visit again soon!')
		res.render('index', { message : req.flash('message') });
	}
};

module.exports = authenticationController;