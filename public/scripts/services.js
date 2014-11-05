

function BooksObject ($http) {
	this.getAllUserBooks = function(userId, callback) {
		$http.get('/allUserBooks', {params: { userId: userId }})
		.success(function(data, status, headers, config) {
			callback(null, data);
		})
		.error(function(data,status, headers, config) {
			callback(data, {});
		});
	};

	this.getUserBook = function(userId, title, callback) {
		$http.get('/userBook', {params: {userId: userId,
										title: title }})
		.success(function(data, status, headers, config) {
			callback(null, data);
		})
		.error(function(data, status, headers, config) {
			callback(data, {});
		})
	};

};

bookApp.service('bookServices', ['$http', BooksObject])