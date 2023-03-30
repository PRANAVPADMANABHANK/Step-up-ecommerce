require('dotenv').config();
const mongoose = require('mongoose')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcrypt') //Importing bcrypt package
const cors = require("cors")
const bodyParser = require('body-parser')
const fast2sms = require('fast-two-sms')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const session = require('express-session')
const connectDB = require('./server/config/db')
const multer = require('multer')
const methodOverride = require('method-override');



//modules

var userRouter= require('./routes/user');
var adminRouter = require('./routes/admin')



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(expressLayout);



connectDB();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout','./layouts/layout')

app.use(methodOverride('_method'));
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session
  ({secret:"Key",
 resave: false,
 saveUninitialized: true,
 cookie:{maxAge:43200} //12 hours
}));

app.use('/', userRouter);
app.use('/admin',adminRouter)




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

module.exports = app;
