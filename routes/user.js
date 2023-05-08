var express = require('express');
var router = express.Router();
const fast2sms = require("fast-two-sms");
const otplib = require('otplib');
const secret = otplib.authenticator.generateSecret();
const userController = require('../controllers/userControllers')
const addressController = require('../controllers/addressControllers')
const couponControllers = require('../controllers/couponControllers')
const bcrypt = require('bcrypt')
const orderController =require('../controllers/orderControllers')



// router.use(verifyUserLogin = (req, res, next) => {
//   if (req.session.user) {
//     next();
//   } else {
//     res.redirect('/login');
//   }
// });

router.get('/index',userController.cartCount,userController.indexPage)

router.get('/profile',userController.isLogin,userController.cartCount,userController.userProfile)
router.patch('/profile/:id',userController.editUserProfile);
router.patch('/address',userController.updateUserAddress);
router.delete('/address/:id',userController.deleteUserAddress);
router.patch('/addressEdit',userController.addressEdit)
router.post('/update-user-password',userController.confirmAndUpdatePassword);



router.get('/signup',userController.userSignup)
router.get('/login',userController.loginPage)


router.get('/',userController.cartCount,userController.homePage)


router.get('/women',userController.cartCount,userController.getWomenPage)
router.get('/kids',userController.cartCount,userController.getKidsPage)




router.get('/singleProduct/:id',userController.cartCount,userController.userSingleProduct)

router.get('/home',userController.userHome)
router.post('/signup', userController.postSignup)
router.post('/login',userController.postLogin)
router.get('/logout',userController.logout)

router.get('/cart',userController.isLogin,userController.cartCount,userController.getCartProducts)
router.get('/addtocart/:id',userController.isLogin,userController.cartCount,userController.addtoCart)


router.get('/product-size-selector/:id/',userController.productSizeSelector)

router.post('/otp',userController.otpLogin)
router.get('/otp',(req,res)=>{
  res.render("user/otp",{other:true})
})
router.get('/verify',userController.verify)
router.post('/verify',userController.postVerify)
// router.get('/success',userController.otpSuccess)
// router.get('/error',userController.otpError)

router.post('/changeProductQuantity',userController.changeProductQuantity)
router.post('/removeItem',userController.removeItem)

router.get('/address',userController.deliveryAddress)
router.post('/address',userController.deliveryAddressPost) // url for check out page 


router.get('/shop',userController.cartCount,userController.getShop)

//user saved address
router.get('/savedAddress',userController.isLogin,userController.cartCount,userController.savedAddressget)
router.post('/savedAddress',userController.savedAddressPost)

router.get('/editSavedAddress/:id',userController.cartCount,userController.editSavedAddress)
router.post('/editSavedAddress/:id',userController.editSavedAddressPost)
router.delete('/deleteAddress/:id', userController.deleteAddress);

router.get('/orderPlaced',userController.orderPlacedCod)
router.get('/Orders',userController.isLogin,userController.cartCount,userController.orders)
router.get('/viewOrderProducts/:id',userController.isLogin,userController.cartCount,userController.viewOrderProducts)


router.post('/verify-payment',userController.paymentVerify);
router.get('/payment-failed',userController.paymentFailed);

router.get('/paymentsuccess/',userController.successPagePayPal);
router.get('/paypal-cancel/',userController.cancelPagePayPal)



router.get('/filter/:categoryId', userController.filterPost);
router.get('/filterSub/:subcategoryId', userController.filterSub);



router.post('/add-address',addressController.addAddressPost)



router.post('/apply-coupon',couponControllers.applyCoupon);

router.post('/orders/date',orderController.sortOrders);
router.get('/cancel-order/',userController.isLogin,orderController.cancelOrder);
router.get('/return-order/',userController.isLogin,orderController.returnOrder);
router.get('/order-not-shipped',userController.isLogin,orderController.listOfNotShippedOrder);
router.get('/order-cancelled-list',userController.isLogin,orderController.listOfCancelledOrder);
router.get('/order-returned-list',userController.isLogin,orderController.listOfReturnedOrder);
router.get('/invoice/',userController.isLogin,orderController.invoice);



// router.use((req, res, next) => {
//   res.render('user/404')
// })

// error handling middleware
// router.use(function(req, res, next) {
//   res.status(404).render('404', { pageTitle: '404 Page Not Found' });
// });

module.exports = router;
