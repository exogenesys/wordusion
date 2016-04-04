var Account = require('../models/account');
var Chat = require('../models/chat');

module.exports.index = index;
module.exports.register = register;
module.exports.login = login;
module.exports.logOut = logOut;
module.exports.score = score;
module.exports.chat = chat;
module.exports.chatAll = chatAll;


function index(req, res){
	res.send({'user': req.user});
};

function login(req, res){
	console.log('Login!');
	var item = {};
	Account.findOne({ 'username': req.body.username}, function(err, data) {
	  if (err){
	  	return console.error(err);
			item.auth = false;
			res.send(item);
		}
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
			res.send({'success' : false});
			return next(err);
		} else {
			console.log('user registered!');
			res.send({'username' : username, 'success' : true});
		}
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
	  if (err || !user)
	  	return console.error(err);
	  else {
			if(Boolean(result)){
				console.log('ey');
				user.score_won++;
			} else {
				console.log('ram');
				user.score_lost++;
			}
	  }
		res.send(user);
		user.save(function(err){
			if(err)
				console.log(err);
		});
	});
};

function chatAll(req, res){
	Chat.find(function(err, messages) {
		if (err)
			res.send(err);
		else {
			res.send(messages);
		}
	});
}

function chat(req, res){
	var unique = req.params.id;
	if (unique == undefined){
	}else{
		Chat.find({ 'chatid' : unique}, function(err, messages) {
			if (err)
				res.send(err);
			else {
				res.send(messages);
			}
		});
	}
}
