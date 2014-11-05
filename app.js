var express = require('express');
// Express-session allows us to use cookies to keep track of a user 
// pages, and need cookie-parser to load those cookies.
var session = require('express-session');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
// Flash allows storage of quick one-time use messages between views.
// Messages are removed right after use -- useful for error messages.
var flash = require('connect-flash');

var passport = require('passport');
var passportConfig = require('./config/passport');

var authenticationController = require('./controllers/authentication.js');
var indexController = require('./controllers/index.js');

var mongoose = require('mongoose');
// Connect to database
mongoose.connect(process.env.MONGOLAB_URI||'mongodb://localhost/myBookStack');

// Define the base express app
var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(cookieParser());
app.use(flash());

// Initialize express-session with a secret property
app.use(session({
	secret: 'readingrocks',
	saveUninitialized: true,
	resave: true
}));

// Hook in passport to the middleware chain
app.use(passport.initialize());

// Hook in the passport session management into middleware chain
app.use(passport.session());

// Get request for viewing the login page
// ******** This get is likely not needed since signing in from home page *****
// app.get('/auth/login', authenticationController.login);

// Landing page - user not logged in
app.get('/', indexController.index);

// Routes for jade partials
app.get('/partials/:name', indexController.partials);


// Post received from the login form
app.post('/login', authenticationController.processLogin);

app.post('/signup/check/username', authenticationController.checkUserNameUnique);

// Post received from register new user form
app.post('/signup', authenticationController.processSignup);

// Logout requests
app.post('/logout', authenticationController.logout);


// ******* IMPORTANT ***************
// This middlewar prevents unauthorized access to any route handlers that 
// follow this call to .use()
app.use(passportConfig.ensureAuthenticated);

// All routes that follow can only be accessed if a user has been authenticated
// ---------------------  ROUTES ----------------------------------------------
// Logged in user route
app.get('/loggedin/:userName', indexController.loggedInUser);

app.post('/books/getall', indexController.getAllBooks);

app.get('/books/getbook', indexController.getBook);

app.post('/books/addbook', indexController.addBook);

app.post('/books/updatebook', indexController.updateBook);

app.post('/books/deletebook', indexController.deleteBook);

app.post('/posts/getposts', indexController.getPost);

app.post('/posts/addpost', indexController.addPost);

app.post('/posts/addreply', indexController.addReply);

var server = app.listen(process.env.PORT||8907, function() {
	console.log('Express server listening on port ' + server.address().port);
});
