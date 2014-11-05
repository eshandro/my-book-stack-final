var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// Note: there are two modes being required from posts.js:
// Post.Reply and Post.PostThread
var Post = require('../models/posts.js');

var bookLoverSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	userName: String,
	books: [{
			title: String,
			author: String,
			stack: String,
			color: String,
		}],
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]

});
// Grab a new user before it is saved to encrypt the password
bookLoverSchema.pre('save', function(next) {
	// If password is not modified, just move on - next()
	if(!this.isModified('password')) return next();

	// Store access to 'this', which is the current user document
	var bookLover = this;

	// Generate 'salt' to wrap password
	bcrypt.genSalt(10, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(bookLover.password, salt, function(err, hash) {
			if(err) return next(err);
			// Change entered password to encrypted password
			bookLover.password = hash;
			return next();
		});
	});
});

// Add method to the bookLoverSchema to check if entered password is a match
bookLoverSchema.methods.comparePassword = function(enteredPassword, next) {
	bcrypt.compare(enteredPassword, this.password, function(err, isMatch) {
		if(err) return next(err);
		// Pass on the match status to to the next middleware - next()
		return next(null, isMatch);
	});
};

var BookLover = mongoose.model('bookLover', bookLoverSchema);

module.exports = BookLover;