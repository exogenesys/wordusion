var express = require('express'),
	partials = require('express-partials'),
	app = express(),
	routes = require('./routes'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	//csrf = require('csurf'),
	session = require('express-session'),
	flash = require('connect-flash'),
	config = require('./config'),
	io = require('./socket.io'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	cookieSession = require('cookie-session'),
	LocalStrategy = require('passport-local').Strategy;


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser(config.secret));


//new stuff
var Account = require('./models/account');
passport.use(Account.createStrategy());

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://heroku_q46gwrlr:79v177tu5jbrdm9c0cep95lopc@ds019058.mlab.com:19058/heroku_q46gwrlr', function(err) {
  if (err) {
    console.log('Could not connect to mongodb on localhost. Ensure that you have mongodb running on localhost and mongodb accepts connections on standard ports!');
  } else {
		console.log('Mon is go');
	}
});

//routes
app.get('/', routes.index);
app.get('/chat', routes.chatAll);
app.get('/chat/:id', routes.chat);
app.get('/user/update/score/:username/:result', routes.score);
app.post(config.routes.login, function(req, res, next){
	passport.authenticate('local', function(err, user){
	if (err) { return next(err); }
	  if (!user) {
			console.log('2');
			res.send({'auth':false}); }
	  req.logIn(user, function(err) {
	    if (err) { return next(err); }
			console.log('2');
	    // return res.redirect('/users/' + user.username);
	  });
	})(req, res, next)
}), routes.login);

app.get(config.routes.logout, routes.logOut);
app.post(config.routes.register, routes.register);

app.get('/error', function(req, res, next){
	next(new Error('A contrived error'));
});

var server = app.listen(process.env.PORT);
io.startIo(server);
