const express = require('express');
const router = express.Router();
const fast2sms = require("fast-two-sms");
const otplib = require('otplib');
const secret = otplib.authenticator.generateSecret();
const userController = require('../controllers/userControllers')
const addressController = require('../controllers/addressControllers')
const couponControllers = require('../controllers/couponControllers')
const bcrypt = require('bcrypt')
const orderController =require('../controllers/orderControllers')
const wishlistController = require('../controllers/wishlistControllers')
const userVerify = require('../middlewares/userVerify');


router.use(userVerify.wishListCount);

router.get('/index',userController.cartCount,userController.indexPage)

//GET HOME PAGE
router.get('/',userController.cartCount,userController.homePage)
router.get('/women',userController.cartCount,userController.getWomenPage)
router.get('/kids',userController.cartCount,userController.getKidsPage)
router.get('/profile',userController.isLogin,userController.cartCount,userController.userProfile)
router.patch('/profile/:id',userController.editUserProfile)
router.patch('/address',userController.updateUserAddress)
router.delete('/address/:id',userController.deleteUserAddress)
router.patch('/addressEdit',userController.addressEdit)
router.post('/update-user-password',userController.confirmAndUpdatePassword)

//user controller
router.get('/signup',userController.userSignup)
router.get('/login',userController.loginPage)
router.get('/home',userController.userHome)
router.post('/signup', userController.postSignup)
router.post('/login',userController.postLogin)
router.get('/logout',userController.logout)


//otp controller
router.post('/otp',userController.otpLogin)
router.get('/otp',userController.otp)
router.get('/verify',userController.verify)
router.post('/verify',userController.postVerify)

//cart controller
router.post('/changeProductQuantity',userController.changeProductQuantity)
router.post('/removeItem',userController.removeItem)
router.get('/cart',userController.isLogin,userController.cartCount,userController.getCartProducts)
router.get('/addtocart/:id',userController.isLogin,userController.cartCount,userController.addtoCart)
router.get('/product-size-selector/:id/',userController.productSizeSelector)
router.get('/singleProduct/:id',userController.cartCount,userController.userSingleProduct)

//cart count middleware
router.get('/shop',userController.cartCount,userController.getShop)

//user saved address
router.get('/address',userController.deliveryAddress)
router.post('/address',userController.deliveryAddressPost)
router.get('/savedAddress',userController.isLogin,userController.cartCount,userController.savedAddressget)
router.post('/savedAddress',userController.savedAddressPost)
router.get('/editSavedAddress/:id',userController.cartCount,userController.editSavedAddress)
router.post('/editSavedAddress/:id',userController.editSavedAddressPost)
router.delete('/deleteAddress/:id', userController.deleteAddress)

//payment controller
router.post('/verify-payment',userController.paymentVerify)
router.get('/payment-failed',userController.paymentFailed)
router.get('/paymentsuccess/',userController.successPagePayPal)
router.get('/paypal-cancel/',userController.cancelPagePayPal)

//category and subcategory controller
router.get('/filter/:categoryId', userController.filterPost)
router.get('/filterSub/:subcategoryId', userController.filterSub)

//address controller
router.post('/add-address',addressController.addAddressPost)

//coupon controller
router.post('/apply-coupon',couponControllers.applyCoupon)

//order controller
router.get('/orderPlaced',userController.orderPlacedCod)
router.get('/Orders',userController.isLogin,userController.cartCount,userController.orders)
router.get('/viewOrderProducts/:id',userController.isLogin,userController.cartCount,userController.viewOrderProducts)
router.post('/orders/date',orderController.sortOrders)
router.get('/cancel-order/',userController.isLogin,orderController.cancelOrder)
router.get('/return-order/',userController.isLogin,orderController.returnOrder)
router.get('/order-not-shipped',userController.isLogin,orderController.listOfNotShippedOrder)
router.get('/order-cancelled-list',userController.isLogin,orderController.listOfCancelledOrder)
router.get('/order-returned-list',userController.isLogin,orderController.listOfReturnedOrder)
router.get('/invoice/',userController.isLogin,orderController.invoice)

//wishlist
router.get('/wishlist',userController.isLogin,userController.cartCount,wishlistController.wishListPage);
router.get('/add-to-wishlist/:id',wishlistController.addToWishList);
router.get('/wishlist/:id',wishlistController.removeFromWishlist);
router.get('/wishlist-to-cart/:id',userController.cartCount,wishlistController.wishlistToProDetails);

//Rewards
router.get('/Rewards',userController.isLogin,userController.cartCount,couponControllers.getReward)


module.exports = router;
