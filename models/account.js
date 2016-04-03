var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  created_at: Date,
  score_won: Number,
  score_lost: Number
});


Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
