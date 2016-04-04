var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatId = new Schema({
  chatid: String
})

module.exports = mongoose.model('ChatId', ChatId);
