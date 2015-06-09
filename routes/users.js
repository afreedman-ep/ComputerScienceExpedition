var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');
var mid = require('../middleware');

router.get('/', mid.loggedIn, function(req, res) {
  res.render('auth/index', {user: req.user});
});

router.get('/users', mid.loggedIn, mid.isAdmin, function(req, res) {
  User.find({}).exec().then(function(users) {
    res.render('auth/users', {users: users});
  });
});

router.get('/login', function(req, res) {
  res.render('auth/login', {user: req.user});
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function(req, res) {
  res.redirect(req.session.returnTo || '/bots');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/register', function(req, res) {
  res.render('auth/register');
});

router.post('/register', function(req, res, next) {
  User.register(new User({username: req.body.username.toLowerCase()}), req.body.password, function(err) {
    if (err) { return next(err); }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/bots');
    });
  });
});

module.exports = router;
