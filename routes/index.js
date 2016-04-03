var Account = require('../models/account');

module.exports.index = index;
module.exports.register = register;
module.exports.login = login;
module.exports.logOut = logOut;
module.exports.score = score;

function index(req, res){
	res.send({'user': req.user});
};

function login(req, res){
	console.log('Login!');
	var item = {};
	Account.findOne({ 'username': req.body.username}, function(err, data) {
	  if (err)
	  	return console.error(err);
	  else {
	  	item.username = data.username;
			item.score_won = data.score_won;
			item.score_lost = data.score_lost;
			item.auth = true;
	  	res.send(item);
	}
	});
};

function register(req, res, next){
	console.log('Registeration!');
	var username = req.body.username;
	Account.register(new Account({username: req.body.username, score_won: 0, score_lost: 0}), req.body.password, function(err) {
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

function score(req, res){
	var username = req.params.username;
	var result = req.params.result;
	Account.findOne({ 'username': username}, function(err, user) {
	  if (err)
	  	return console.error(err);
	  else {
			if(result)
				user.score_won++;
			else
				user.score_lost++;
	  	}
			user.save(function(err){
				if(err)
					console.log(err);
			});
	});
};
