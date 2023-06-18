const express = require('express');
const router = express.Router()
const { verifyAdminLogin } = require('../middlewares/adminMiddleware');
const productController = require('../controllers/productControllers')
const adminController = require('../controllers/adminControllers');
const userController = require('../controllers/userControllers')
const subCategoryController = require('../controllers/subCategoryControllers')
const couponControllers = require('../controllers/couponControllers')
const bannerControllers = require('../controllers/bannerControllers')
const multer = require('multer');
// const product = require('../models/product');


// Set storage engine for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/banners');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });



//  GET admin listing.
router.get('/dashboard', verifyAdminLogin, adminController.getDashboard);
router.get('/adminLogin', adminController.adminLogin);
router.post('/adminLogin', adminController.postAdminLogin);
router.get('/admin', verifyAdminLogin, productController.getAllProducts);
router.get('/logout', adminController.logout);

//product controller
router.get('/addProduct',verifyAdminLogin, productController.addProductPage)
router.post('/addProduct',productController.postProduct)
router.delete('/deleteProduct/:id', productController.deleteProduct)
router.get('/editProduct/:id',productController.getEditProductPage)
router.post('/editProduct/:id',productController.editProduct)

//user controller
router.get('/userListView',verifyAdminLogin,userController.userslist)
router.get('/block/:id',userController.blockUser)
router.get('/unBlock/:id',userController.unBlockUser)
router.delete('/delete/:id',userController.deleteUser)

//category controller
router.get('/addCategory',verifyAdminLogin,adminController.addCategory)
router.post('/addCategory',adminController.addCategoryPost)
router.get('/addsubCategory',verifyAdminLogin,subCategoryController.CreateSubcategory)
router.post('/addsubCategory',subCategoryController.createSubcategoryPost)

//order controller
router.get('/Orders',verifyAdminLogin,adminController.Orders)
router.post('/order-details/',adminController.orderDetailsAdmin)
router.get('/sales-report',verifyAdminLogin,adminController.salesSummary)
router.post('/sales-report',adminController.salesReport)

//coupon controller
router.get('/coupon',verifyAdminLogin,couponControllers.couponPage)
router.post('/coupon',couponControllers.postCoupon)
router.patch('/coupon-disable/:id',couponControllers.disableCoupon)
router.patch('/coupon-enable/:id',couponControllers.enableCoupon)
router.get('/edit-coupon',couponControllers.editCoupon)
router.post('/update-coupon',couponControllers.updateCoupon)   

//banner controller
router.get('/banner',verifyAdminLogin,bannerControllers.getBanner)
router.post('/banner',bannerControllers.addBanner)


module.exports = router;