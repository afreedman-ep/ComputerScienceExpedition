var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var hbs = require('hbs');
var kue = require('./queue').kue;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

require('./db');
require('./users');

var mid = require('./middleware');

var routes = require('./routes/index');
var bots = require('./routes/bots');
var users = require('./routes/users');

var app = express();

// register partials for handlebars
hbs.registerPartials(__dirname + '/views/partials');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// bodyparser json middleware
app.use(bodyParser.json());
// bodyparser urlencoding middleware
app.use(bodyParser.urlencoded({ extended: false }));
// parse cookies
app.use(cookieParser());
// passport things
app.use(session({secret: 'iz secret', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());
// use less stylesheets
app.use(require('less-middleware')(path.join(__dirname, 'public')));
// serve files from public folder
app.use(express.static(path.join(__dirname, 'public')));

var User = require('mongoose').model('User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  if(req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  if(req.isAuthenticated() && req.user.admin) {
    res.locals.admin = true;
    res.locals.pid = process.pid;
    if(app.get('worker')) {
      res.locals.worker = {
        id: app.get('worker'),
        count: require('os').cpus().length
      };
    }
  }
  next();
});

app.use('/', routes);
app.use('/', users);
app.use('/bots', mid.loggedIn, bots);
app.use('/queue', kue.app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  // use the dev logger
  app.use(logger('dev'));
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
