var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  username: {type: String, unique: true},
  password: String,
  bots: Array,
  admin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);

User.count({}).exec().then(function(c) {
  if(c < 1) {
    var user = new User({
      username: 'admin',
      salt: 'b7187ad81e6e74d55dac115ed704290804ce1d7344c635c3a74c4b689469d496',
      hash: 'ca611f3c9e7a7681a8e8ff9ab50bc44061643b794c3a1a36e9e4831a1924efbac2ba3b33a6141ad61121ad054ff4b62e702dafe680a4feaaf8729e32fe20d51d743aae9dd522704f05b57c09d33ec640621cbfac073127cfe35d0b09d461665312463d7a9319b89493fdd4b7da25e830a75ca6710219d1ab041fb7ee3abdcda79f56c730f263f04f7e4aae4d1503c4adabcb6dfbb4645a010df9c933854da55938b346a1ca186661a0e300fe85ea0d68decec22ae355823fb0a4795b883f4c9c56ce40d8cfd90ec5d65ca3d8e283a01eebeb2cdfb7de2c5541f026db875678b9bcf555b8de7270bfebd121a5ebcb1863ca3d3c0624d0bd746df0ecba4adeaad4bf3cb015c9657ae01f43e56d7ae9975195bc79bab7319c3374438a8ba632daf770cb96e793f680c22e874aa0c627845d613d0a4d35f9d6fc350fcc78096999baa4d3ef5de50148dd2704c38f113badab8f813e1277e826281532d1701340d9b7775a2c19056c879961917c5a9f2bd9b994870fec0be1b122d1586474a0c25922077912bc2b44500f0926c58a63b4be46a0604d6bb8a95592e48097a9c1c75921e80fad9da5925ce2e0627d7d74b05cccdaee0bcfe111975421aa26becfb57046b4c4c7ce278028f87710149c1ff609fdaa8e0a8f4370b326343aabe8f62871d6c82dee5bd45887d9f362753b0f6c07e025721679b455b4ed112be9a1049652b8',
      admin: true
    });
    user.save();
  }
});
