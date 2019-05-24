const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morganLogger = require('morgan');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');
const mongo = require('./mongo')
const socket = require('./socket')

/*------------------------------------------------------------
    DATABASE INITIALIZATION
------------------------------------------------------------*/
const memeAdmins = {
  '76561197999893894': 3, //owner
  '76561198355502988': 3, //owner
  '76561198028218196': 2, //owner
}

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new SteamStrategy({
  returnURL: 'http://localhost/api/return',
  realm: 'http://localhost/',
  apiKey: '5D64E8F77EA55968AD791120BCEBED0C'
},
function(identifier, profile, done) {
  process.nextTick(function () {
    profile.isAdministrator = memeAdmins[profile.id];
    profile.identifier = identifier;
    return done(null, profile);
  });
}));

/*------------------------------------------------------------
    EXPRESS ENGINE SETUP
------------------------------------------------------------*/
const app = express();
app.set('view engine', 'ejs')
app.set('views', './views')

/*------------------------------------------------------------
    SESSION SETUP
------------------------------------------------------------*/
const sessionMiddleware = session({
  secret: '나는빡빡이다',
  resave: false,
  saveUninitialized: true})

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

/*------------------------------------------------------------
    EXPRESS STUFFS SETUP
------------------------------------------------------------*/
app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static(path.join(__dirname, 'public')));

/*------------------------------------------------------------
    PAGE ROUTERS SETUP
------------------------------------------------------------*/
const indexRouter = require('./routes/index');
const logMate = require('./routes/logmate');
const apiRouter = require('./routes/api');
const warnRouter = require('./routes/warn');
const modRouter = require('./routes/moderate');
const modBan = require('./routes/ban');

app.use('/', indexRouter);
app.use('/logmate', logMate);
app.use('/api', apiRouter);
app.use('/warns', warnRouter);
app.use('/mod', modRouter);
app.use('/bans', modBan);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {
  app: app,
  session: sessionMiddleware
}
