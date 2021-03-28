const crypto = require('crypto');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "https://itransition-coursework.herokuapp.com/user/auth/twitter/callback"
},
  function (token, tokenSecret, profile, cb) {
    //console.log(profile);
    User.findOrCreate({
      where: {
        username: profile.username
      },
      defaults: {
        username: profile.username,
        email: "example@gmail.com",
        role: "user"
      }
    })
    return cb(null, profile);
  }
));

router.get('/auth/twitter',
  passport.authenticate('twitter')
);

router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'https://itransition-coursework.herokuapp.com/login' }),
  function (req, res) {
    res.redirect('https://itransition-coursework.herokuapp.com');
  });

passport.use(new VKontakteStrategy({
  clientID: process.env.VKONTAKTE_APP_ID,
  clientSecret: process.env.VKONTAKTE_APP_SECRET,
  callbackURL: "https://itransition-coursework.herokuapp.com/user/auth/vkontakte/callback",
  scope: ['email'],
  profileFields: ['email']
},
  function (accessToken, refreshToken, params, profile, done) {
    User.findOrCreate({
      where: {
        username: profile.username
      },
      defaults: {
        username: profile.username,
        email: params.email,
        role: "user"
      }
    })
    return done(null, profile);
  }
));

router.get('/auth/vkontakte',
  passport.authenticate('vkontakte', { scope: ['email'] })
);

router.get('/auth/vkontakte/callback',
  passport.authenticate('vkontakte', { failureRedirect: 'https://itransition-coursework.herokuapp.com/login' }),
  function (req, res) {
    res.redirect('https://itransition-coursework.herokuapp.com');
  });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://itransition-coursework.herokuapp.com/user/auth/google/callback",
  scope: ['profile', 'email'],
},
  function (accessToken, refreshToken, profile, done) {
    User.findOrCreate({
      where: {
        username: profile.displayName
      },
      defaults: {
        username: profile.displayName,
        email: profile.emails[0].value,
        role: "user"
      }
    })
    return done(null, profile);
  }
));

router.get('/auth/google',
  passport.authenticate('google', {
    scope: ["profile", "email"]
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'https://itransition-coursework.herokuapp.com/login' }),
  function (req, res) {
    res.redirect('https://itransition-coursework.herokuapp.com');
  });


function isValidEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

router.post('/register', async function (req, res, next) {
  if (!req.body.username) {
    return res.json({ status: 'error', message: 'You have to provide a username.' });
  }

  if (!isValidEmail(req.body.email)) {
    return res.json({ status: 'error', message: 'Email address not formed correctly.' });
  }

  if (!req.body.password) {
    return res.json({ status: 'error', message: 'You have to provide a password.' });
  }

  var salt = crypto.randomBytes(64).toString('hex');
  var password = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512').toString('base64');

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
      const username = req.user.username || req.user.displayName
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