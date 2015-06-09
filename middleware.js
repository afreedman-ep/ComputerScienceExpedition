var User = require('mongoose').model('User');

function loggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
  }
}

function isAdmin(req, res, next) {
  User.findById(req.user._id).exec().then(function(user) {
    if(user.admin) {
      next();
    } else {
      res.redirect(req.originalUrl);
    }
  });
}

function isLoggedIn(req, res, next) {
  if(req.user) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  loggedIn: loggedIn,
  isLoggedIn: isLoggedIn,
  isAdmin: isAdmin
};
