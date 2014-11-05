var mongoose = require('mongoose');


//  books schema created here
var bookSchema = mongoose.Schema({
	title: String,
	author: String,
});


var Book = mongoose.model('book', bookSchema);

module.exports = Book