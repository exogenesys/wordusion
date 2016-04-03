var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var	cookie = require('cookie'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	unirest = require('unirest');


var numUsers = 0,
users = {},
que = {0:{}, 1:{}},
flag = false;

var socketConnection = function socketConnection(socket){
	console.log('Hi');
	var addedUser = false;
	// when the client emits 'add user', this listens and executes
	// socket.on('add user', function (user) {
	// 	ide = socket.id;
	// 	console.log('User Added.');
	// 	console.log(flag);
	// 	console.log(que);
	// 	if(flag){
	//
	// 		que[1].ide = socket.id;
	// 		que[1].socket = socket;
	//
	// 		que[0].socket.emit('opponent', {'opponent' : que[1].ide, 'you' : que[0].ide});
	// 		que[1].socket.emit('opponent', {'opponent' : que[0].ide, 'you' : que[1].ide});
	// 		console.log('Someone said opponent');
	//
	//
	// 		var one = que[0].ide, two = que[1].ide;
	//
	// 		users[one] = que[0].socket;
	// 		users[two] = que[1].socket;
	//
	// 		console.log(que);
	// 		que = {0:{}, 1:{}};
	// 		flag = false;
	// 	} else {
	// 		que[0].ide = socket.id;
	// 		que[0].socket = socket;
	// 		console.log(que);
	// 		flag = true;
	// 	}
	// });

	socket.on('add user', function (user) {
		ide = socket.id;
		console.log('User Added.');
		console.log(flag);
		console.log(que);

			que[0].ide = socket.id;
			que[0].socket = socket;
			console.log(que);

			que[1].ide = socket.id;
			que[1].socket = socket;

			que[0].socket.emit('opponent', {'opponent' : que[1].ide, 'you' : que[0].ide});
			que[1].socket.emit('opponent', {'opponent' : que[0].ide, 'you' : que[1].ide});
			console.log('Someone said opponent');


			var one = que[0].ide, two = que[1].ide;

			users[one] = que[0].socket;
			users[two] = que[1].socket;

			console.log(que);
			que = {0:{}, 1:{}};
			flag = false;
});


	socket.on('game start', function (data) {
		console.log('Someone said game start');
		// These code snippets use an opensource library. http://unirest.io/nodejs
		var type_n = ((Math.floor(Math.random() * 10))%2 + 1);
		var type = "verbs";
		if(type_n%2){
			//type = "adjective";
		}
		var maxLength = 12;
		var minLength = 4;
		var api_key = "";
		var maxCorpusCount = 50000;
		var minCorpusCount = 10000;

		unirest.get("http://api.wordnik.com/v4/words.json/randomWord?"
		+"hasDictionaryDef=false"
		+"&minCorpusCount="+minCorpusCount
		+"&maxCorpusCount="+maxCorpusCount
		+"&minDictionaryCount=1"
		+"&maxDictionaryCount=-1"
		+"&minLength="+minLength
		+"&maxLength="+maxLength
		+"&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5")
		.end(function (result) {
			var word = result.body.word;
			var url = "http://api.wordnik.com:80/v4/word.json/"+word+"/definitions?limit=1&includeRelated=false&sourceDictionaries=wiktionary&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
			unirest.get(url)
			.header("Accept", "application/json")
			.end(function (result) {
				if(result.body[0].text == undefined){
					var definition = "Something is really something";
					var partOfSpeech = "Something is really something";
				} else {
					var definition = result.body[0].text;
					var partOfSpeech = result.body[0].partOfSpeech;
				}
				users[data.opponent].emit('game start', {
					'word' : word,
					'definition' : definition,
					'partofspeech': partOfSpeech,
					'opponentUsername' : data.username
				});
				console.log({
					'word' : word,
					'definition' : definition,
					'partofspeech': partOfSpeech,
					'opponentUsername' : data.username
				});
			});
		});
	});

	socket.on('opponent word', function (data) {
		users[data.opponent].emit('opponent word', {
			'opponentWord' : data.word
		});
		console.log({
			'opponentWord' : data.word
		});
		console.log(data.opponent);
	});

	// when the client emits 'new message', this listens and executes
	socket.on('new message', function (data) {
		// we tell the client to execute 'new message'
		console.log(data);
		var n = data.message.indexOf(data.word);

		//Check this
		if (n == -1 && (m =! null)){
		} else {
			console.log('wordDeployed : ' + n);
			users[data.you].emit('word deployed', {
				'wordDeployed' : true,
				'who' : data.you,
			});
			users[data.opponent].emit('word deployed', {
				'wordDeployed' : true,
				'who' : data.you,
			});
		}

		var m = data.message.match(/\*([^*]*)\*/);
		if (m == null){
			users[data.opponent].emit('new message', {
				'opponent' : data.you,
				'message' : data.message
			});
		} else {
			console.log(m[1]);
			if(data.opponentWord == m[1]){
				users[data.you].emit('word guessed', {
					'wordGuessed' : true,
					'who' : data.you
				});
				users[data.opponent].emit('word guessed', {
					'wordGuessed' : true,
					'who' : data.you
				});
			} else {
				users[data.you].emit('word guessed', {
					'wordGuessed' : false,
					'who' : data.you,
					'word' : m[1]
				});
				users[data.opponent].emit('word guessed', {
					'wordGuessed' : false,
					'who' : data.you,
					'word' : m[1]
				});
			}
		}
	});

	socket.on('game over', function (data) {
		if(users[data.you] == undefined || users[data.opponent] == undefined){
			console.log(data);
		} else {
			var yourWordDeployedtimer = 180 - (data.youWordDeployed / 1000);
			var youGuessedtimer = 180 - (data.youWordGuessed / 1000);
			var opponentWordDeployedtimer = 180 - (data.opponentWordDeployed / 1000);
			var opponentGuessedtimer = 180 - (data.opponentWordGuessed / 1000);

			console.log('yourWordDeployedtimer : '  + yourWordDeployedtimer);
			console.log('youGuessedtimer : '  + youGuessedtimer);
			console.log('opponentWordDeployedtimer : '  + opponentWordDeployedtimer);
			console.log('opponentGuessedtimer : '  + opponentGuessedtimer);

			var winner = "", loser = "";
			if(youGuessedtimer == 180.001){
				youGuessedtimer = opponentWordDeployedtimer;
			}
			if(opponentGuessedtimer == 180.001){
				opponentGuessedtimer = yourWordDeployedtimer;
			}

			if (((180 - yourWordDeployedtimer) + (180 - youGuessedtimer + opponentWordDeployedtimer)) > ((180 - opponentWordDeployedtimer) + (180 - opponentGuessedtimer + yourWordDeployedtimer))){
				loser = data.opponent;
				winner = data.you;
			} else {
				winner = data.opponent;
				loser = data.you;
			}

			console.log('you : '+((180 - yourWordDeployedtimer) + (opponentWordDeployedtimer - youGuessedtimer)));
			console.log('opponent : '+((180 - opponentWordDeployedtimer) + (yourWordDeployedtimer - opponentGuessedtimer)));


			users[winner].emit('result', {
				'string' : 'You won!'
			});
			users[loser].emit('result', {
				'string' : 'You lose!'
			});

			delete users[data.you];
			delete users[data.opponent];

		}

	});


	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function (data) {
		console.log(data + ' is typing');
		if(users[data.opponent] == undefined){}else{
			users[data.opponent].emit('typing', {
				opponent: data.you
			});
		}
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', function (data) {
	if(users[data.opponent] == undefined){}else{
		users[data.opponent].emit('stop typing', {
			opponent: data.you
		});
	}
	});

	// when the user disconnects.. perform this
	socket.on('discon', function (data) {
		console.log('disconnect');
		console.log(data.where);
		if(users[data.you] == undefined){
			que = {0:{}, 1:{}};
			flag = false;
			console.log('1');
		} else {
			if(users[data.opponent] == undefined){
				delete users[data.you];
				console.log('2');
			} else {
				delete users[data.you];
				users[data.opponent].emit('user left', {
					opponent: data.you
				});
				console.log('3');
			}
		}
	});

/*
	socket.on('GetMe', function(){
		socket.emit('GetMe', models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
	});

	socket.on('GetUser', function(room){
		var  usersP = redisChat.getUsersinRoom(room.room);
		usersP.done(function(users){
			socket.emit('GetUser', users);
		});
	});

	socket.on('GetChat', function(data){
		redisChat.getChat(data.room, function(chats){
			var retArray = [];
			var len = chats.length;
			chats.forEach(function(c){
				try{
					retArray.push(JSON.parse(c));
				}catch(e){
					log.error(e.message);
				}
				len;
				if (len === 0) socket.emit('GetChat', retArray);
			});
		});
	});

	socket.on('AddChat', function(chat){
		var newChat = models.Chat(chat.message, chat.room,
			models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
		redisChat.addChat(newChat);
		socket.broadcast.to(chat.room).emit('AddChat', newChat);
		socket.emit('AddChat', newChat);
	});

	socket.on('GetRoom', function(){
		redisChat.getRooms(function(rooms){
			var retArray = [];
			var len = rooms.length;
			rooms.forEach(function(r){
				retArray.push(models.Room(r));
				len;
				if(len === 0) socket.emit('GetRoom', retArray);
			});
		});
	});

	socket.on('AddRoom', function(r){
		var room = r.name;
		removeAllRooms(socket, function(){
			if (room !== '')
			{
				socket.join(room);
				redisChat.addRoom(room);
				socket.broadcast.emit('AddRoom', models.Room(room));
				socket.broadcast.to(room).emit('AddUser',
					models.User(socket.request.user.id, socket.request.user.displayName, socket.request.user.provider));
				redisChat.addUserToRoom(socket.request.user.id, room);
			}
		});
	});

	socket.on('disconnect', function(){
    removeAllRooms(socket, function(){});
	});
*/

};

exports.startIo = function startIo(server){

	io = io.listen(server);
	//io.adapter(redisAdapter({host: config.redisHost, port: config.redisPort}));

	//var packtchat = io.of('/packtchat');
	//packtchat.use(socketAuth);
	//packtchat.on('connection', socketConnection);

	//io.use(socketAuth);
	io.on('connection', socketConnection);
	return io;

};

exports.io = io;
