var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Chat = new Schema({
  message: String,
  sender: String
})

module.exports = mongoose.model('Chat', Chat);
