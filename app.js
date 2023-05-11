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
const MongoDBStore = require('connect-mongodb-session')(session);
const connectDB = require('./server/config/db')
const multer = require('multer')
const methodOverride = require('method-override');
const toastr = require('express-toastr');
// Import the middleware function
const getBanners = require('./middlewares/bannermiddleware');
const flash = require('express-flash');

const XLSX = require('xlsx');
const htmlToText = require('html-to-text');
const $ = require('jquery');



// const { MongoDBStore } = require('connect-mongodb-session');


//modules

var userRouter= require('./routes/user');
var adminRouter = require('./routes/admin');




var app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Register the middleware function
app.use(getBanners);


app.use(expressLayout);

//session store
const mongoDBStore = new MongoDBStore({ 
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});

connectDB();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout','./layouts/layout')

// Add the flash middleware to your Express app
app.use(flash());
app.use(toastr());  

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  next();
});


app.use(methodOverride('_method'));
app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//session config
app.use(session
  ({secret:process.env.COOKIE_SECRET,
 resave: false,
 store: mongoDBStore,
 saveUninitialized: true,
 cookie:{maxAge:1000 * 60 * 60 * 24} //24 hours
}));
app.use((req,res,next)=>{
  res.header('cache-control','private,nocache,no-store,must revalidate')
  res.header('expurse','-1')
  res.header('parama','no-cache')
next()
})

app.use('/', userRouter);
app.use('/admin',adminRouter)




// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
// Handle 404 errors
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
// app.use(function(err, req, res, next) {
//   // Set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // Render the 404 page
//   res.status(err.status || 404);
//   res.render('user/404',{other:true});
// });
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
