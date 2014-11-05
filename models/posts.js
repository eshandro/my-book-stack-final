var mongoose = require('mongoose');
var BookLover = require('../models/bookLovers.js');

/*var replySchema = mongoose.Schema({
	userName: String,
	subject: String,
	timestamp: { type: Date, default: Date.now },
	body: String,
	replies: [replySchema]
}, {_id: true } );

var postThreadSchema = mongoose.Schema({
	_creator: { type: Number, ref: 'BookLover' },
	postId: mongoose.Schema.ObjectId,
	title: String,
	replies: [replySchema]
});*/

var PostSchema = mongoose.Schema({
	subject: String,
	body: String,
	timestamp: { type: Date, default: Date.now },
	userName: String,
	replies: [{
		body: String,
		replyUserName: String,
		postUserId: Number,
		timestamp: { type: Date, default: Date.now }
	}],
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'BookLover' },

})

/*PostSchema.statics = {
	loadRecent: function(callback) {
		this.find({})
		.populate({path: 'author', select: 'userName'})
		.sort('-timestamp')
		.limit(5)
		.exec(callback);
	}
};*/

/*var Reply = mongoose.model('reply', replySchema);
var PostThread = mongoose.model('postthread', postThreadSchema);*/

var Post = mongoose.model('post', PostSchema);

// Create a new test Post

/*var post = new Post({
	userName: 'Testguy',
	subject: 'Test post',
	body: 'This is the test post for Testguy',
	author: '53ebb7e70eafaf63bf256787', 
})

post.save();

// Create a 2nd test post
var post = new Post({
	userName: 'Testguy',
	subject: 'Test post 2',
	body: 'This is the test post number 2 for Testguy',
	author: '53ebb7e70eafaf63bf256787', 
})

post.save();
*/
module.exports = Post;

/*{
	Reply: Reply,
	PostThread: PostThread
}*/