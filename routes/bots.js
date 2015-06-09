var express = require('express');
var router = express.Router();
var Bot = require('mongoose').model('Bot');
var User = require('mongoose').model('User');
var jobs = require('../queue').jobs;
var mid = require('../middleware');

var err = function(err) {
  console.log(err);
};

function canViewBot(req, res, next) {
  User.findById(req.user._id).exec().then(function(user) {
    if(user.admin || user.bots.indexOf(req.params.id) > -1) {
      next();
    } else {
      res.redirect('/bots');
    }
  }).then(null, err);
}

/* @GET index for bots */
router.get('/', function(req, res) {
  User.findById(req.user._id).exec().then(function(user) {
    if(req.user.admin) {
      Bot.find({}).exec().then(function(bots) {
        res.render('bots/index', {bots: bots,bot:true});
      });
    } else {
      Bot.find({
        '_id': { $in: user.bots }
      }).exec().then(function(bots) {
        res.render('bots/index', {bots: bots,bot:true});
      });
    }
  });
});

router.get('/create', function(req, res) {
  res.render('bots/create', {bot:true});
});

router.post('/create', function(req, res) {
  User.findById(req.user._id).exec().then(function(user) {
    Bot.findOne({name: 'default'}).exec().then(function(defaultBot){
      var bot = new Bot({
        name: req.body.botName,
        code: defaultBot.code,
        owner: {
          id: req.user._id,
          username: req.user.username
        }
      });
      user.bots.push(bot._id);
      bot.save();
      user.save();
      res.redirect('/bots/'+bot._id);
    });
  });
});

/* @GET show dahsboard for :id */
router.get('/dashboard/:id', canViewBot, function(req, res) {
  Bot.findById(req.params.id).exec().then(function(bot) {
    res.render('bots/dashboard', {bot:bot});
  }).then(null, err);
});

/* @GET show edit for :id */
router.get('/edit/:id', canViewBot, function(req, res) {
  Bot.findById(req.params.id).exec().then(function(bot) {
    res.render('bots/editor', {bot: bot});
  }).then(null, err);
});

/* @POST update file */
router.post('/edit/:id', function(req, res) {
  Bot.findById(req.params.id).exec().then(function(bot) {
    if(req.body.id === req.params.id) {
      bot.code = req.body.code;
      bot.save(function (err) {
        if (err) return handleError(err);
        res.redirect(req.params.id);
      });
    }
  }).then(null, err);
});

/* @POST run bot */
router.post('/run/:id', function(req, res) {
  // find bot in db and assign contets to `bot`
  Bot.findById(req.params.id, function(err, bot) {
    // create job wit hthe job queue
    var job = jobs.create('run bot', {
      title: bot.name,
      code: bot.code
    });
    job.save();
    // bug in kue makes it so I have to wait a few ms before the job.id works
    job.on('complete', function(result) {
      res.render('bots/result', {id: job.id, runs: bot.runs, result: result, bot:true});
    });
    bot.runs += 1;
    bot.save();
  });
});

/* @GET redirect by id */
/* HAS TO BE LAST ROUTE IN FILE */
router.get('/:id', function(req, res) {
  res.redirect('dashboard/'+req.params.id);
});

module.exports = router;
