const config = require('./config/config');
require('dotenv').config()
const express = require('express')
const expressSession = require('express-session');
var cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const path = require('path');
const bodyParser = require('body-parser')
const passport = require('./config/passportConfig')

const app = express()
app.set('modulos',path.join(__dirname, 'modulos/'));
app.set('views', process.cwd());
app.set('view engine', 'ejs');
app.use('/static', express.static(process.cwd() + '/public'));
app.use('/external-libs', express.static(process.cwd() + '/node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//secret
app.use(cookieParser(process.env.SECRET));
app.use(flash());

app.use(expressSession({
  cookieName: 'session',
  secret: process.env.SECRET,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

module.exports = () => {
  config.modulos.forEach((m)=>{
    app.use(require(path.join(__dirname, `modulos/${m.name}/routes.js`)));
  })
  app.get('/', (req,res)=>{
   res.render('./views/index')
  })
  return app;
}
