var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vind');

var BotSchema = mongoose.Schema({
  name: {type: String, default: '', unique: true},
  runs: {type: Number, default: 0},
  owner: Object,
  code: {type: String, default: ''}
});

var Bot = mongoose.model('Bot', BotSchema);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

// Grabs the code from the test.js file to be used for default/starter bot code
var defaultCode = fs.readFileSync('test.js', 'utf8');

var bot = new Bot({name: 'default', code: defaultCode})
Bot.count({}).exec().then(function(c) {
  if(c < 1) {
    bot.save();
  }
}).then(null, function(err) {
  console.log(err);
});
