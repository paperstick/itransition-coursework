require("dotenv").config()
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon')
const cors = require('cors');
const mysql = require('mysql');
const expressSession = require('express-session');
const MySQLStore = require('express-mysql-session')(expressSession)
const passport = require('passport');
const userRouter = require('./routes/user');
const tableRouter = require('./routes/table');
const bookRouter = require('./routes/book');
const app = express();
const WebSocket = require("ws");
const Comment = require('./models').Comment;

/* DATABASE SETUP */
const connection = ((process.env.NODE_ENV === 'production') 
  ? mysql.createConnection(process.env.JAWSDB_URL)
  : mysql.createPool({
      host: "localhost",
      user: "root",
      password: process.env.DB_PASSWORD,
      database: "coursework",
      useConnectionPooling: true
    })
)

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 30000,
  expiration: 1000
}, connection);

if (process.env.NODE_ENV === 'production') {
  app.use(cors())
} else {
  app.use(cors(
    {
    "origin": "http://localhost:3000",
    "credentials": true,
    "methods": "GET, POST"
    }
  ));
}

app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

var expireDate = new Date();
expireDate.setDate(expireDate.getDate() + 1);

app.use(expressSession({
  resave: true,
  saveUninitialized: true,
  secret: 'secret',
  store: sessionStore,
  cookie: { expires: expireDate }
}));

/* PASSPORT SETUP */
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/table', tableRouter);
app.use('/book', bookRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')))
  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

passport.serializeUser(function (user, done) {
  done(null, { id: user.id, username: user.username || user.displayName, email: user.email, role: user.role, status: user.status });
});

passport.deserializeUser(function (user, done) {
  done(null, user)
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log('App is listening on port ' + port));

const wss = new WebSocket.Server({ server: server });

wss.on('connection', (ws, req) => {
  ws.on('message', async m => {
    const comment = JSON.parse(m)
    console.log(comment)
    await Comment.create({
      author: comment.author,
      UserId: comment.UserId,
      BookId: comment.BookId,
      text: comment.text
    }).then((data) => {})
    await Comment.findAll({
      where: {
        BookId: comment.BookId
      }
    })
    .then((data) => {
      wss.clients.forEach(
        client => client.send(
          JSON.stringify(data)
        )
      );
    })
  });
  Comment.findAll({
    where: {
      BookId: req.url.substring(1)
    }
  })
  .then((data) => {
    wss.clients.forEach(
      client => client.send(
        JSON.stringify(data)
      )
    );
  })

  ws.on("error", e => ws.send(e));
});
