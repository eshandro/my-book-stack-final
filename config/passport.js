var passport = require('passport');

// *******  May need to change this here or add in a new strategy to 
// *******  work with Facebook etc.
var LocalStrategy = require('passport-local').Strategy;

var BookLover = require('../models/bookLovers.js');

// Serialization happens here:
// Takes the bookLover object and converts it to a small, unique string 
// which is represented by the id and store it in the session
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

// Deserialization:
// Opposite of above, takes user id out of the session and convert it into 
// an actual user object
passport.deserializeUser(function(id, done) {
	BookLover.findById(id, function(err, user) {
		done(err, user);
	});
});

// Define the strategy for our local authentication
// Note: first parameter passed to LocalStrategy connects the LocalStrategy
// 'usernameField' to the 'email' field from UI signin form
var localStrategy = new LocalStrategy( {usernameField: 'email'}, 
	function(email, password, done) {
		console.log('localStrategy started');

	// First, check for the email/user in the DB
	BookLover.findOne({email: email}, function(err, user) {
		if(err) return done(err);
		// if no user found continue to the next middleware and tell
		// passport that auth failed
		if(!user) {
			console.log('no user found error triggered');
			return done(null, false, {message: "No user with that email address found. "});
		}
		user.comparePassword(password, function(err, isMatch) {
			if (err) return done(err);

			// isMatch is true if passwords match and false if they don't
			if(isMatch) {
				// a match, tell passport
				return done(err, user);
			} else {
				// no match, tell passport login failed
				return done(null, false, {message: "Incorrect password. "});
			}
		});
	});
});

// Tell passport about LocalStrategy definition
passport.use(localStrategy);

// This blocks access to all routes if not logged in by redirecting to the 
// login page

module.exports = {
	ensureAuthenticated: function(req, res, next) {
		// If current user is logged in
		if(req.isAuthenticated()) {
			// Move to the next middleware
		    console.log('ensureAuthenticated -- user logged in')
			return next();
		}
		// Current user is not logged in
		// **********  This redirect may need to be changed or not used
		console.log('ensureAuthenticated -- user not logged in')
    	res.render('index');

	}
};
