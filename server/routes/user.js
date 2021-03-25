const crypto = require('crypto');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models').User;
const Book = require('../models').Book;
const Comment = require('../models').Comment;
const Chapter = require('../models').Chapter;
const Rating = require('../models').Rating;
const express = require('express');
const router = express.Router();

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
},
  async function (username, password, done) {
    const user = await User.findOne({
      where: {
        username: username,
        status: "Unblocked"
      }
    });
    if (!user) { return done(null, false, { message: 'Incorrect username.' }) }
    if (crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('base64') != user.password) { return done(null, false, { message: 'Incorrect password.' }) }
    return done(null, user);
  }
));

function isValidEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

router.post('/register', async function (req, res, next) {
  var salt = crypto.randomBytes(64).toString('hex');
  var password = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512').toString('base64');

  if (!isValidEmail(req.body.email)) {
    return res.json({ status: 'error', message: 'Email address not formed correctly.' });
  }

  try {
    var user = await User.create({
      username: req.body.username,
      email: req.body.email,
      role: "user",
      password: password,
      salt: salt
    });
  } catch (err) {
    return res.json({ status: 'error', message: 'Email address or username already exists.' });
  }
  if (user) {
    passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/register' }, function (err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        return res.json({ status: 'error', message: info.message });
      }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        return res.json({ status: user.status, username: user.username, id: user.id, email: user.email, role: user.role });
      });
    })(req, res, next);
  }
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }, function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.json({ status: 'error', message: info.message });
    }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      return res.json({ status: user.status, username: user.username, id: user.id, email: user.email, role: user.role });
    });
  })(req, res, next);
});

router.get('/usersTable',
  require('connect-ensure-login').ensureLoggedIn('/login'),
  async function (req, res, next) {
    if (req.user) {
      if (req.user.role === 'user') {
        res.status(403).send({
          message:
            "You are not allowed to access this page."
        });
      } else {
        const users = await User.findAll()
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                "Some error occurred while retrieving users."
            });
          });
      }
    } else {
      return res.status(401).send({
        'message': 'You are not authenticated.',
      });
    } (req, res, next);
  });

router.get('/logout',
  function (req, res) {
    req.logout();
    res.send('User is logged out')
  });

router.get('/userData',
  async function (req, res) {
    if (req.user === undefined) {
      res.json({});
    } else {
      const username = req.user.username
      let user = await User.findOne({
        where: {
          username: username,
          status: 'Unblocked'
        }
      });
      req.logIn(user, function (err) {
        if (err) { return res.json({ status: 'error', message: "You're blocked" }); }
        return res.json({ status: user.status, username: user.username, id: user.id, email: user.email, role: user.role });
      });
    }
  }
);

router.get('/profileData', async (req, res) => {
  await User.findOne({
    where: {
      username: req.query.username
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Some error occurred while retrieving profile data."
      });
    });
}
);

//Comment.sync({ force: true })
//Chapter.sync({ force: true })
//Book.sync({ force: true })
//User.sync({ force: true })
//Rating.sync({ force: true })

module.exports = router;