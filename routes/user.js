var express = require('express');
var router = express.Router();
const fast2sms = require("fast-two-sms");
const otplib = require('otplib');
const secret = otplib.authenticator.generateSecret();
const userController = require('../controllers/userControllers')
const bcrypt = require('bcrypt')




router.get('/index',(req,res)=>{
  res.render('user/index',{other:true})
})



router.get('/signup', function(req, res) {
  res.render('user/User_Signup',{other:true})
});
router.get('/login', userController.loginPage)


router.get('/', userController.homePage)


router.get('/women', function(req, res) {
  res.render('user/women',{other:true})
});
router.get('/kids', function(req, res) {
  res.render('user/kids',{other:true})
});




router.get('/home',userController.userHome)
router.post('/signup', userController.postSignup)
router.post('/login',userController.postLogin)
router.get('/logout',userController.logout)
router.get('/cart',userController.userCart)
router.post('/otp',userController.otpLogin)
router.get('/otp',(req,res)=>{
  res.render("user/otp",{other:true})
})
router.get('/verify',userController.verify)
router.post('/verify',userController.postVerify)
router.get('/success',userController.otpSuccess)
router.get('/error',userController.otpError)





module.exports = router;
