var Account = require('../models/account');

module.exports.index = index;
module.exports.register = register;
module.exports.login = login;
module.exports.logOut = logOut;
module.exports.user = user;

function index(req, res){
	res.send({'user': req.user});
};

function login(req, res){
	console.log('Login!');
	res.send({username : req.body.username, auth : true});
};

function register(req, res, next){
	console.log('Registeration!');
	var username = req.body.username;
	Account.register(new Account({username: req.body.username}), req.body.password, function(err) {
		if (err) {
			console.log('error while user register!', err);
			return next(err);
		}
		console.log('user registered!');
		res.send({'username' : username});

	});
};

function logOut(req, res){
	console.log('logout');
	req.logout();
	res.send({'logout' : true});
};

function user(req, res){
	var username = req.params.username;
	console.log(username);
	Account.findOne({ 'username': username }, function(err, score) {
	  if (err) 
	  	return console.error(err);
	  else {
	  	res.send(score);
	  	console.log(score);}
	});
};
