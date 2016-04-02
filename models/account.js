var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  name: String,
  created_at: Date
});


Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
