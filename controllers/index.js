var mongoose = require('mongoose');

var BookLover = require('../models/bookLovers.js');
var Book = require('../models/books.js');
// Note: there are two modes being required from posts.js:
// Post.Reply and Post.PostThread
var Post = require('../models/posts.js');

var _ = require('underscore');

var sanitizer = require('sanitizer');

var indexController = {
	// Landing/signin/signup page route
	index: function(req, res) {
		res.render('index');
	},
	
	// Route for all partial views
	partials: function(req,res) {
		console.log('partials :name ', req.params.name)
		res.render('partials/' + req.params.name);
	},


	// route for loggedin view - main view
	loggedInUser: function(req,res) {
		var currentUser = req.user.userName;
		console.log('currentUser in loggedin route: ', currentUser)
		res.render('user', { 
			user: req.user,
			url: req.url 
		});
	},

	// The route for the $http call to get all books for a user
	getAllBooks: function(req,res) {
		console.log('getAll req.user: ', req.user);
		console.log('getAll req.body: ', req.body)
		var id = req.user._id;
		BookLover.findById(id, 'books', function(err, books) {
			res.send(books);
		});
	},

	// Route for the $http to get one book
	// Not using at this point
	getBook: function(req, res) {
		console.log(req.params)
	},

	//  Route to make add new book to a user's db collection
	//  Also adds to the book to the books collection
	addBook: function(req, res) {
		// console.log('addBook req.body', req.body);
		var id = req.user._id; 
		var newBook = {
			title: sanitizer.escape(req.body.title),
			author: sanitizer.escape(req.body.author),
			stack: req.body.stack,
			color: req.body.color,
		};
		console.log('newBook: ', newBook);
		BookLover.findByIdAndUpdate(id, {$push: {books: newBook}}, function(err, updatedBookLover) {
			if (err) {
				console.log('addBook error thrown')
				res.send('addBook error: ' + err)
			}
			console.log('addBook return: ', updatedBookLover)
			res.send(updatedBookLover.books[updatedBookLover.books.length-1]);
		});
		var collectionBook = new Book( {
			title: req.body.title,
			author: req.body.author,
		});
		collectionBook.save(function(err, collectionBook) {
/*			// this is the duplicate key error, meaning a 'unique' field
			// is a duplicate
			if(err.code === 11000) {
				console.log("duplicate book tried to save");
			}*/
			console.log('new book added to collection books: ', collectionBook)
		});
	},

	updateBook: function(req, res) {
		var userId = req.user._id;
		var searchTitle = req.body.title.trim();
		var updateKey = req.body.updateKey;
		var updateValue = req.body.updateValue;
		
		BookLover.findOne({'_id': userId}, function(err, updatedBookLover) {
				if(err) {
					res.send('Update book error: ' + err)
				}
				
				var book = _.find(updatedBookLover.books, function(book) {
					return book.title === searchTitle;
				});
				// console.log(book)
				book[updateKey] = updateValue;
				updatedBookLover.markModified('books');
				updatedBookLover.save(function(err, result) {
					res.send(result);
				});
			});
	},

	deleteBook: function(req, res) {
		var userId = req.user._id;
		var searchTitle = req.body.title.trim();

		BookLover.findOne({ '_id': userId }, function(err, bookLover) {
			if (err) {
				console.log('find error in deleteBook thrown')
				res.send('Delete book error: ' + err)
			}
			var index = 0;
			console.log('books before splice: ', bookLover.books.length)
			for (var i = 0; i < bookLover.books.length; i++) {
				if(bookLover.books[i].title === searchTitle) {
					index = i;
					break;
				}
			}
			var splicedBook = bookLover.books.splice(index, 1);
			console.log('books after splice: ', bookLover.books.length)
			bookLover.markModified('books');
			bookLover.save(function(err, result) {
				res.send(result)
			})		
		});
	},


	//  Route for $http request that gets a PostThread
	getPost: function(req, res) {
		Post.find( {author: req.body.author })
		.sort('-timestamp')
		.limit(5)
		.exec(function(err, posts) {
			if(!posts) {
				console.log('No posts found for this author')
				res.send(null);
			}
			else {
				res.send(posts);
			}
		});
	},

// Route for $http post request that adds a new post to db and returns object
	addPost: function(req, res) {
		var newPostInfo = req.body.newPost;
		
		var newPost = new Post({
			subject: sanitizer.escape(newPostInfo.subject),
			body: sanitizer.escape(newPostInfo.body),
			userName: newPostInfo.userName,
			author: newPostInfo.author
		});
		newPost.save();
		res.send(newPost);
 	},

 	addReply: function(req, res) {
 		console.log('addReply received from app: ', req.body.newReply)
 		var newReplyObj = {
 			postId: req.body.newReply.postId,
 			replyUserName: sanitizer.escape(req.body.newReply.replyUserName),
 			body: sanitizer.escape(req.body.newReply.body),
 			timestamp: req.body.newReply.timestamp
	 		}
	 	Post.findOneAndUpdate({ _id: newReplyObj.postId }, {$push: { replies: newReplyObj }},
	 		function(err, results) {
	 			if(err) {
	 				console.log('Error saving new reply: ', err)
	 			}
	 			else {
	 				console.log('new reply update: ', results)
	 				res.send(results)
	 			}
	 		})
 	},


	
};

module.exports = indexController;