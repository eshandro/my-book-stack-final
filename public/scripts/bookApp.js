// Declare app level module which depends on services
var bookApp = angular.module('bookApp', ['ngRoute', 
	'ui.bootstrap', 'ngAnimate', 'ngSanitize'
	] );

// --------------------------- Services -------------------------------------------------
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------

// current user info for use in other controllers
function CurrentUserObject () {
	this.currentUserId = null;

	this.currentUserName = null;

	this.currentUserBooks = [];

	this.sortBooksByStack = function(list) {
		var currentUserBooks = this.currentUserBooks;
		for(var i=0; i < currentUserBooks.length; i++) {
			if(currentUserBooks[i].stack === 'current-read') {
				currentUserBooks[i].sortNumber = 1;
			}
			if(currentUserBooks[i].stack === 'future-read') {
				currentUserBooks[i].sortNumber = 2;
			}
			if(currentUserBooks[i].stack === 'recent-read') {
				currentUserBooks[i].sortNumber = 3;
			}
			if(currentUserBooks[i].stack === 'archived') {
				currentUserBooks[i].sortNumber = 4;
			}
		}
		var sortedList = _.sortBy(list, function(item) {
			return item.sortNumber;
		});
		this.currentUserBooks = sortedList;
	};

	this.filterByStack = function(booksList, stack) {
		var filteredList = _.filter(booksList, function(book) {
			return book.stack === stack;
		});
		return filteredList;
	};

	this.currentStackList = this.filterByStack(this.currentUserBooks, 'current-read');
	this.recentStackList = this.filterByStack(this.currentUserBooks, 'recent-read');
	this.futureStackList = this.filterByStack(this.currentUserBooks, 'future-read');
}
bookApp.service('currentUserServices', [ '$http', CurrentUserObject ]);

// --------------------------------------------------------------------------------------
// Book services - getting books and adding books
function BooksObject ($http) {
	this.getAllUserBooks = function(userId, callback) {
		$http.post('/books/getall', {'id': userId})
		.success(function(data, status, headers, config) {
			console.log('getAllUserBooks success data: ', data);
			callback(null, data);
		})
		.error(function(data,status, headers, config) {
			callback(data, {});
		});
	};

	this.getUserBook = function(userId, title, callback) {
		$http.get('/books/getbook')
		.success(function(data, status, headers, config) {
			callback(null, data);
		})
		.error(function(data, status, headers, config) {
			callback(data, {});
		});
	};

	this.addBook = function(book, callback) {
		$http.post('/books/addbook', { 'title': book.title,
									'author': book.author,
									'stack': book.stack,
									'color': book.color,
									})
		.success(function(data, status, headers, config) {
			console.log('addBook success data: ', data);
			if (callback) callback(null, data);
		})
		.error(function(data, status, headers, config) {
		});
	};

	this.updateBook = function(title, updateKey, updateValue, callback) {
		$http.post('/books/updatebook', { 'title': title,
										'updateKey': updateKey,
										'updateValue': updateValue 
									})
		.success(function(data, status, headers, config) {
			console.log('updateBook a success - data: ', status);
			if (callback) callback(null, data);
		})
		.error(function(data, status, headers, config) {
			if (callback) callback(data, status);
		});
	};

	this.deleteBook = function(title, callback){
		$http.post('/books/deletebook', { 'title': title })
		.success(function(data, status, headers, config) {
			if (callback) callback(data, status);
			console.log('deleteBook a success');
		})
		.error(function(data, status, headers, config) {
			console.log('deleteBook causes error');
			if (callback) callback(data, status);
		});
	};

	this.setBookColor = function() {
		console.log('setBookColor called');
		var randomColor = _.random(1,4);
		switch(randomColor) {
			case 1:
				randomColor = 'red';
				break;
			case 2:
				randomColor = 'blue';
				break;
			case 3:
				randomColor = 'green';
				break;
			case 4:
				randomColor = 'black';
				break;
			default:
				randomColor = 'black';
		}
		return randomColor;
	};
}
bookApp.service('bookServices', ['$http', BooksObject]);

// --------------------------------------------------------------------------------------
// Post services - getPosts, addPost, addReply

function PostObject ($http) {	
	this.allPosts = [];

	// Gets the 5 most recent posts for the current user
	this.getPosts = function(authorId, callback) {
		$http.post('/posts/getposts', {author: authorId})
			.success(function(data, status, headers, config) {

				console.log('getPost http data success');
				callback(null, data);
			})
			.error(function(data, status, headers, config) {
			});		
	};

	// Adds a new post to db and returns it to the page
	this.addPost = function(newPost, callback) {
		$http.post('/posts/addpost', { newPost: newPost })
			.success(function(data, status, headers, config) {
				
				console.log('addPost http data: ', data);
				callback(null, data);
			})
			.error(function(data, status, headers, config) {
			});
	};

	// Adds a new reply to db and returns to the page
	this.addReply = function(newReply, callback) {
		$http.post('/posts/addreply', {newReply: newReply})
			.success(function(data, status, headers, config) {
				console.log('addReply http data', data);
				callback(null, data);
			})
			.error(function(data, status, headers, config) {

			});
	}; 
}
bookApp.service('postServices', ['$http', 'currentUserServices', PostObject]);

// --------------------------------------------------------------------------------------
// drag and drop services
function DragDropObject(currentUserServices, bookServices) {
	
	this.makeDroppable = function(item) {
		$(item).droppable({ tolerance: "touch" });	
	};

	this.makeDraggable = function(item) {
		$(item).draggable({ revert: 'invalid',
						cursor: 'move',
						contain: 'window',
						 });	
	};

	this.updatesOnDrop = function(e,ui,dropElemId) {
		var droppedBookElem = $(ui.draggable[0]);
		console.log(droppedBookElem);
		console.log('dropElemId id: ', dropElemId);
		var oldStack = '';
		var newStack = dropElemId;
		var updateValue = '';
		var updateKey = 'stack';
		var bookTitle = '';

		console.log('newStack ', newStack);
		// Set newStack based on it's id and set updateValue based on newStack
		if (newStack === 'recent-stack') {
			newStack = 'recentStackList';
			updateValue = 'recent-read';
		}
		else if (newStack === 'current-stack') {
			newStack = 'currentStackList';
			updateValue = 'current-read';
		}
		else if (newStack === 'future-stack') {
			newStack = 'futureStackList';
			updateValue = 'future-read';
		}
/*		console.log('before else ', updateValue);
		console.log('before else newStack ', newStack);*/
		// Not a stack so must be trash or archive
		else if (updateValue === '') {
			updateValue = dropElemId;
		}
		console.log('updateValue ', updateValue);
		// If droppedBookElem is dropped in same stack it is already in, end func
		if (droppedBookElem.hasClass(newStack)) {
			// This fixes issue with cuursor staying as 'selected' after a drop
			$('body').css('cursor', 'auto');			
			return;
		}
		// Otherwise set oldStack based on the class of the dropped book			
		if (droppedBookElem.hasClass('recentStackList')) {
			oldStack = 'recentStackList';
		}
		if (droppedBookElem.hasClass('currentStackList')) {
			oldStack = 'currentStackList';
		}
		if (droppedBookElem.hasClass('futureStackList')) {
			oldStack = 'futureStackList';
		}
		console.log('oldStack', oldStack);

		// Get title of dropped book
		if (droppedBookElem.hasClass('vertical-book')) {
			bookTitle = droppedBookElem.find('p').text();				
		}
		if (droppedBookElem.hasClass('horizontal-book')) {
			bookTitle = droppedBookElem.text();
		}
		// Trim whitespace of book before sending to server
		bookTitle = bookTitle.trim();
		console.log('bookTitle: ', bookTitle);
		
		// Trash/delete a book 
		if (updateValue === 'trash') {
			// Remove trashed element from DOM
			droppedBookElem.effect('explode', 'slow', function() {
				droppedBookElem.remove(); 
			});

			// Remove trashed book from it's stack
			var index = null;
			console.log('before splice: ', currentUserServices[oldStack]);
			for (var i = 0; i < currentUserServices[oldStack].length; i++) {
				if(currentUserServices[oldStack][i].title === bookTitle) {
					index = i;
					break;
				}
			}
			var splicedBookStack = currentUserServices[oldStack].splice(index, 1);
			console.log('after splice: ', currentUserServices[oldStack]);

			// Remove from the currentUserBooks
			var index2 = null;
			for (var j = 0; j < currentUserServices.currentUserBooks.length; j++) {
				if(currentUserServices.currentUserBooks[i].title === bookTitle) {
					index2 = j;
					break;
				}
			}
			var splicedBookUser = currentUserServices.currentUserBooks.splice(index2, 1);

			// Remove book from user's database
			bookServices.deleteBook(bookTitle);


			// Fix bug where cursor gets stuck as 'selected'
			$('body').css('cursor', 'auto');
			
			// After slight delay, make sure all books are draggable after 
			// redrawn from ng-repeat on data change
			var self = this;
			setTimeout(function() {
				self.makeDraggable('.book');
				
			}, 200);
			return;		
		}
		// End trash/delete
	
		// Do database stack update
		bookServices.updateBook(bookTitle, updateKey, updateValue);

		// Update currentUserServices.currentUserBooks and then sort
		console.log('currentUserBooks pre update: ', currentUserServices.currentUserBooks);
		for (var i = 0; i < currentUserServices.currentUserBooks.length; i++) {
			// console.log('currentUserBooks[i].title: ', currentUserServices.currentUserBooks[i].title, bookTitle);
			if (currentUserServices.currentUserBooks[i].title === bookTitle) {
				console.log('stack pre change ', currentUserServices.currentUserBooks[i].stack);
				currentUserServices.currentUserBooks[i].stack = updateValue;
				break;
			}
		}
		console.log('currentUserBooks post update: ', currentUserServices.currentUserBooks);
		currentUserServices.sortBooksByStack(currentUserServices.currentUserBooks);

		// Update the currentUserServices stack it came from
		var index = 0;
		console.log('before splice: ', currentUserServices[oldStack]);
		for (var i = 0; i < currentUserServices[oldStack].length; i++) {
			if(currentUserServices[oldStack][i].title === bookTitle) {
				index = i;
				// Change stack value of the dropped book before deleting it from oldStack
				currentUserServices[oldStack][i].stack = updateValue;
				break;
			}
		}
		var splicedBook = currentUserServices[oldStack].splice(index, 1);
		console.log('after splice: ', currentUserServices[oldStack]);
		console.log('splicedBook', splicedBook);

		
		// If archiving and not changing to new stack -- archive and 
		// then end func before adding to newStack
		if (updateValue === 'archived') {
			// Remove archived book from DOM
			droppedBookElem.effect('fade', 'slow', function() {
				droppedBookElem.remove(); 
			});
			
			// Fix bug where cursor gets stuck as 'selected'
			$('body').css('cursor', 'auto');
			
			// After slight delay, make sure all books are draggable after 
			// redrawn from ng-repeat on data change
			var self = this;
			setTimeout(function() {
				self.makeDraggable('.book');
			}, 200);
			return;
		}

		// Now add this book to the newStack
		currentUserServices[newStack].push(splicedBook[0]);
		console.log('newStack post current update', currentUserServices[newStack]);

		// Remove dropped element from DOM
		droppedBookElem.remove();
		// $('.ui-effects-wrapper').remove();
		// $('.book').attr('style', '');
		// This fixes issue with cuursor staying as 'selected' after a drop
		$('body').css('cursor', 'auto');
		
		// After short delay for Angular update to changed stacks make all books draggable
		var self = this;
		setTimeout(function() {
			self.makeDraggable('.book');			
		}, 200);
	};
}
bookApp.service('dragDropServices', ['currentUserServices', 'bookServices', DragDropObject]);

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// -------------------------- Controllers ----------------------------------------
// -------------------------------------------------------------------------------

// This is an init controller to load the current user's info to service = currentUserServices
bookApp.controller('CurrentUserController', ['$scope', 'bookServices', 'currentUserServices', 
										'dragDropServices',
										function($scope, bookServices, currentUserServices, dragDropServices) {
	$scope.currentUser = '';
	$scope.init = function() {
		// console.log('Current User', currentUser._id);
		// Pass current user/bookLover object to currentUserServices 
		$scope.currentUser = currentUser._id;
		currentUserServices.currentUserId = currentUser._id;
		currentUserServices.currentUserName = currentUser.userName;
		currentUserServices.currentUserBooks = currentUser.books;
		currentUserServices.sortBooksByStack(currentUser.books);
	};
	$scope.init();
}]);

// --------------------------------------------------------------------------------------
// This controller opens a modal and loads appropriate jade partial view
bookApp.controller('OpenModal', [ '$scope', '$modal', '$log', function ($scope, $modal, $log) {
	$scope.open = function(route, context) {
		var modalInstance = $modal.open({
			templateUrl: '/partials/' + route, scope: $scope,
		});
	};
} ]);

// --------------------------------------------------------------------------------------
// Signin and sign up controllers
bookApp.controller('SigninController', ['$scope', function($scope) {
	$scope.bookLover = {};
	$scope.bookLover.email = '';
	$scope.bookLover.password = '';
}]);

bookApp.controller('SignupController', ['$scope', function($scope) {
	$scope.newBookLover = {};
	$scope.newBookLover.userName = '';
	$scope.newBookLover.email = '';
	$scope.newBookLover.password = '';
	$scope.newBookLover.confirmPassword = '';

	// This reverts the current input field to the view value if 
	// esc key is pressed
	// Note: This doesn't work here, because in modal and esc closes modal
/*	$scope.cancel = function(e) {
		var currentField = e.target.name;
		console.log(currentField);
		console.log(signupForm[currentField]);
		if (e.keyCode === 27) {
			$scope.signupForm[currentField].$rollbackViewValue();
		}
	}*/
}]);

// Custom directive for input field matching, eg password confirm
bookApp.directive('inputMatch', [function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			var checkMatch = function () {
				// console.log('checkMatch called in inputMatch directive');
				// Get value of passwordConfirm input
				var inputConfirm = scope.$eval(attrs.ngModel);
				// console.log('inputConfirm= ', inputConfirm);
				// Get value of passwordConfirm
				var inputOriginal = scope.$eval(attrs.inputMatch);
				// console.log('inputOriginal: ', inputOriginal);
				return inputConfirm === inputOriginal;				
			};
			scope.$watch(checkMatch, function(n) {
				// Set form control to valid if both passwords 
				// are the same, else invalid
				ctrl.$setValidity('isMatch', n);
			});
		}
	};
}]);

// Custom directeve to check if a new user's userName is unique
bookApp.directive('uniqueUsername', ['$http', function($http) {  
	return {
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {
			// scope.busy = false;
			console.log('custom directive fired on load');
			elem.bind('blur', function(e) {
				// scope.$watch(attrs.ngModel, function(value) {
				var value = elem.val();
				console.log('value', value);
				// hide old error messages
				ctrl.$setValidity('isTaken', true);
				ctrl.$setValidity('invalidChars', true);

				if (!value) {
					// don't send undefined to the server during dirty check
					// empty username is caught by required directive
					return;
				}

				// show spinner
				$('.glyphicon-refresh').removeClass('is-none');
				// scope.busy = true;
				// send request to server
				$http.post('/signup/check/username', {userName: value})
					.success(function(data) {
					// everything is fine -> do nothing and turn off spinner
					$('.glyphicon-refresh').addClass('is-none');			
					// scope.busy = false;
					})
					.error(function(data) {
						// display new error message & hide spinner
						if (data.isTaken) {
						  ctrl.$setValidity('isTaken', false);
						} else if (data.invalidChars) {
						  ctrl.$setValidity('invalidChars', false);
						}
						$('.glyphicon-refresh').addClass('is-none');
						// scope.busy = false;
				});
			});
		}
  	};
}]);

// --------------------------------------------------------------------------------------
// Controls opening and closing of add book form
bookApp.controller('ShowAddBookController', ['$scope', function($scope) {
	$scope.formStatus = {
		formOpen: false,
		showForm: function() {
			console.log('formOpen func called');
			$scope.formStatus.formOpen = true;
		}
	};
}]);

// --------------------------------------------------------------------------------------
// Add a book form functionality
bookApp.controller('AddBookController', ['$scope', 'bookServices', 'currentUserServices', 'dragDropServices',
					function($scope, bookServices, currentUserServices, dragDropServices) {
	$scope.book = {};
	$scope.book.title = null;
	$scope.book.author = null;
	$scope.book.stack = null;
	$scope.book.color = null;

	
	$scope.submit = function($event) {
		$event.preventDefault();
		if (!$scope.book.title || !$scope.book.stack) {
			console.log('addbook form not filled out completely');
			return;
		}
		// Set the color of the book randomlybefore 
		$scope.book.color = bookServices.setBookColor();

		console.log('book info on submit: ', $scope.book);
		// bookServices.addBook = line 106
		bookServices.addBook($scope.book, function(err, newBook) {
			console.log('new book sent back to client: ', newBook);
			// add newBook to current user's list of books and sort after added
			// Then update the appropriate stack so page will add the new book
			
			// Here we use the newBook.stack value to get the correct stack to 
			// update in the currentUserServices stacks
			var stack = newBook.stack;
			var updateStack = '';
			if (stack === 'current-read') {
				updateStack = 'currentStackList';
			}
			if (stack === 'recent-read') {
				updateStack = 'recentStackList';
			}
			if (stack === 'future-read') {
				updateStack = 'futureStackList';
			}

			// First update list of all user's books and sort that list
			currentUserServices.currentUserBooks.push(newBook);
			currentUserServices.sortBooksByStack(currentUserServices.currentUserBooks);
			// Then update the appropriate stack in currentUserServices
			currentUserServices[updateStack].push(newBook);

			// Call makeDraggable on all books to make sure new book is draggable
			// Need to delay so time for angular to add elem to page via ng-repeat 
			// after it reloads from stackBooksList changing
			setTimeout(function() {
				dragDropServices.makeDraggable('.book');
				
			}, 200);
			
			// Resets the form after submit is done
		$scope.formStatus.formOpen = false;
		$scope.book = {};
		$scope.book.title = null;
		$scope.book.author = null;
		$scope.book.stack = null;			
		});
	};
// Clears out and closes add book form if user decides doesn't want to add a book
	$scope.cancel = function($event) {
		$event.preventDefault();
		$scope.formStatus.formOpen = false;
		$scope.book = {};
		$scope.book.title = null;
		$scope.book.author = null;
		$scope.book.stack = null;
	};
}]);
// --------------------------------------------------------------------------------------
// Library popup and other functionality (if any)
bookApp.controller('LibraryController', ['$scope', 'currentUserServices', 
										function($scope, currentUserServices) {
		$scope.library = {};
		$scope.library.booksList = currentUserServices.currentUserBooks;
		$scope.library.userName = currentUserServices.currentUserName;
}]);

// --------------------------------------------------------------------------------------
// Stack controllers 
bookApp.controller('RecentStackController', ['$scope', 'currentUserServices', 'dragDropServices',   
		'bookServices', function($scope, currentUserServices, dragDropServices, bookServices) {
	$scope.recentStack = {};
	$scope.recentStack.booksList = currentUserServices.recentStackList;
	// This watch lets us know that we current user's booklist has been loaded
	// and we can set this booksList to equal it and load the books to the page
	$scope.$watch('currentUserServices.currentUserBooks', function() {
		console.log('$watch triggered in recentStack');
		currentUserServices.recentStackList = currentUserServices.filterByStack(currentUserServices.currentUserBooks, 'recent-read');
		// Set the booksList here to equal same list in currentUserServices
		$scope.recentStack.booksList = currentUserServices.recentStackList;
	});

	dragDropServices.makeDroppable('#recent-stack');

	$(document).on('drop', '#recent-stack', function(e, ui) {
		var dropElemId = this.id;
		dragDropServices.updatesOnDrop(e,ui,dropElemId);
	});
}]);

bookApp.controller('CurrentStackController', ['$scope', 'currentUserServices', 'dragDropServices', 
				'bookServices', function($scope, currentUserServices, dragDropServices, bookServices) {		
	$scope.currentStack = {};
	$scope.currentStack.booksList = currentUserServices.currentStackList;

	// This watch lets us know that we current user's booklist has been loaded
	// and we can set this booksList to equal it and load the books to the page
	$scope.$watch('currentUserServices.currentUserBooks', function() {
		console.log('$watch triggered in currentStack');
		// Set current stack booksList to include only currentStack books
		currentUserServices.currentStackList = currentUserServices.filterByStack(currentUserServices.currentUserBooks, 'current-read');
		// Set the booksList here to equal same list in currentUserServices
		$scope.currentStack.booksList = currentUserServices.currentStackList; 
	});

	dragDropServices.makeDroppable('#current-stack');
	
	// On drop functionality
	$(document).on('drop', '#current-stack', function(e, ui) {
		var dropElemId = this.id;
		dragDropServices.updatesOnDrop(e,ui,dropElemId);
	});		

}]);

bookApp.controller('FutureStackController', ['$scope', 'currentUserServices', 'dragDropServices', 
				'bookServices', function($scope, currentUserServices, dragDropServices, bookServices) {
	$scope.futureStack = {};
	$scope.futureStack.booksList = currentUserServices.futureStackList;

	// This watch lets us know that we current user's booklist has been loaded
	// and we can set this booksList to equal it and load the books to the page
	$scope.$watch('currentUserServices.currentUserBooks', function() {
		console.log('$watch triggered in futureStack');
		currentUserServices.futureStackList = currentUserServices.filterByStack(currentUserServices.currentUserBooks, 'future-read');
		// Set the booksList here to equal same list in currentUserServices
		$scope.futureStack.booksList = currentUserServices.futureStackList; 

		// All books should now be loaded to the page on load
		// So, we can make them all draggable in one call
		// Need to delay so time for angular to add elem to page via ng-repeat 
		// after it reloads from stackBooksList changing
		setTimeout(function() {
			dragDropServices.makeDraggable('.book');
			console.log('makeDraggable called ');				
		}, 200);
	});

	dragDropServices.makeDroppable('#future-stack');
	// Make trash and archive droppable
	dragDropServices.makeDroppable('.trash-can');
	dragDropServices.makeDroppable('.archive-square');

	$(document).on('drop', '#future-stack', function(e, ui) {
		var dropElemId = this.id;
		dragDropServices.updatesOnDrop(e,ui,dropElemId);
	});
}]);

// A custom filter to reverse the order of an ng-repeat -- used in the future stack to put 
// most recent book on top of the stack
bookApp.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});

// --------------------------------------------------------------------------------------
// Trash controller
bookApp.controller('TrashController', ['$scope', 'currentUserServices', 'bookServices', 'dragDropServices',
	function($scope, currentUserServices, bookServices, dragDropServices) {

	$(document).on('drop', '.trash-can', function(e, ui) {
		var dropElemId = this.id;
		dragDropServices.updatesOnDrop(e,ui,dropElemId);
	});
}]);

// --------------------------------------------------------------------------------------
// Archive book controller
bookApp.controller('ArchiveController', ['$scope', 'currentUserServices', 'bookServices', 'dragDropServices',
	function($scope, currentUserServices, bookServices, dragDropServices) {

	$(document).on('drop', '.archive-holder', function(e, ui) {
		var dropElemId = this.id;
		dragDropServices.updatesOnDrop(e,ui,dropElemId);
	});
}]);


// --------------------------------------------------------------------------------------
// Add posts, display posts, add replies
bookApp.controller('NewPostController', ['$scope', 'postServices', 'currentUserServices',
										function($scope, postServices, currentUserServices) {
	$scope.post = {};
	$scope.post.subject = null;
	$scope.post.body = null;
	
	$scope.post.reset = function($event) {
		$event.preventDefault();
		$scope.post.subject =null;
		$scope.post.body = null;
	};

	$scope.post.addPost = function($event) {
		$event.preventDefault();
		if (!$scope.post.subject || !$scope.post.body) return;

		var newPost = {subject: $scope.post.subject, 
							body: $scope.post.body,
							userName: currentUserServices.currentUserName, 
							author: currentUserServices.currentUserId };

		postServices.addPost(newPost, function(err, post) {
			console.log('new post sent back from server after add to db', post);
			postServices.allPosts.unshift(post);
		});
		$scope.$close();
	};
}]);

bookApp.controller('PostsDisplayController', ['$scope', '$http', 'postServices', 'currentUserServices',
											function($scope, $http, postServices, currentUserServices) {

	$scope.postsDisplay = {};											
	$scope.postsDisplay.allPosts = postServices.allPosts;

	$scope.postsDisplay.loadPosts = function() {
		console.log('loadPosts called');
		postServices.getPosts(currentUserServices.currentUserId, function(err, posts) {
			if(err) {
				$scope.postsDisplay.allPosts = [];
			}
			else {
				if (_.isEmpty(posts)) {
					return;
				}
				else {
					for (var i = 0; i < posts.length; i++) {
						// Updates the postServices allPosts to include these posts
						postServices.allPosts.push(posts[i]);
					}
					console.log('allPosts updated: ', $scope.postsDisplay.allPosts);
				}
			}
		});
	};

	$scope.$watch('currentUserServices.currentUserName', function() {
		console.log('$watch triggered in postsDisplay');
		$scope.postsDisplay.loadPosts();
	});
}]);

bookApp.controller('NewReplyController', ['$scope', '$http', 'postServices', 'currentUserServices', 
										function($scope, $http, postServices, currentUserServices) {
	$scope.newReply = {};
	$scope.newReply.userName = null;
	$scope.newReply.body = null;

	$scope.newReply.reset = function($event) {
		$event.preventDefault();
		$scope.newReply.userName = null;
		$scope.newReply.body = null;
	};

	$scope.newReply.addReply = function($event) {
		$event.preventDefault();
		if (!$scope.newReply.userName || !$scope.newReply.body) return;
		
		var newReply = {
							body: $scope.newReply.body, 
							postId: $scope.post._id, 
							replyUserName: $scope.newReply.userName,
							timestamp: new Date()
							};
		postServices.addReply(newReply, function(err, reply) {
			console.log('new reply sent back from server after add to db', reply);
			// This updates postServices allPosts array
			console.log('reply replies array ', reply.replies);
			var postToUpdate = reply._id;
			var i;
			var len = postServices.allPosts.length;
			for (i=0; i < len; i++) {
				if (postServices.allPosts[i]._id === postToUpdate) {
					postServices.allPosts[i].replies.push(reply.replies[reply.replies.length-1]);
					break;
				}
			}
			console.log('allPosts updated on new reply add: ', postServices.allPosts);
		});
		$scope.$close();
	};	
}]);

// --------------------------- Routes ---------------------------------------------------
// --------------------------------------------------------------------------------------
