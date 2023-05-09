var express = require('express');
var router = express.Router()
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
router.get('/adminLogin',adminController.adminLogin)
router.post('/adminLogin',adminController.postAdminLogin)

router.use(verifyAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/admin/adminLogin');
  }
});


router.get('/admin',productController.getAllProducts)
router.get('/logout',adminController.logout)

router.get('/addProduct', productController.addProductPage)


router.post('/addProduct',productController.postProduct)
router.delete('/deleteProduct/:id', productController.deleteProduct);

router.get('/editProduct/:id',productController.getEditProductPage)
router.post('/editProduct/:id',productController.editProduct)


router.get('/dashboard',adminController.getDashboard)

router.get('/userListView',userController.userslist);
router.get('/block/:id',userController.blockUser);
router.get('/unBlock/:id',userController.unBlockUser);
router.delete('/delete/:id',userController.deleteUser);

router.get('/addCategory',adminController.addCategory)
router.post('/addCategory',adminController.addCategoryPost)

router.get('/addsubCategory',subCategoryController.CreateSubcategory)
router.post('/addsubCategory',subCategoryController.createSubcategoryPost)

router.get('/Orders',adminController.Orders)
router.post('/order-details/',adminController.orderDetailsAdmin);
router.get('/sales-report',adminController.salesSummary);
router.post('/sales-report',adminController.salesReport);




router.get('/coupon',couponControllers.couponPage);
router.post('/coupon',couponControllers.postCoupon);
router.patch('/coupon-disable/:id',couponControllers.disableCoupon);
router.patch('/coupon-enable/:id',couponControllers.enableCoupon);
router.get('/edit-coupon',couponControllers.editCoupon);
router.post('/update-coupon',couponControllers.updateCoupon);   


router.get('/banner',bannerControllers.getBanner)
router.post('/banner',bannerControllers.addBanner);




module.exports = router;