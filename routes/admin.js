var express = require('express');
var router = express.Router()
const productController = require('../controllers/productControllers')
const adminController = require('../controllers/adminControllers');
const userController = require('../controllers/userControllers')
const product = require('../models/product');



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
router.delete('/deleteProduct/:id',productController.deleteProduct)
router.get('/editProduct/:id',productController.getEditProductPage)
router.post('/editProduct/:id',productController.editProduct)


router.get('/dashboard',adminController.getDashboard)

router.get('/userListView',userController.userslist);
router.get('/block/:id',userController.blockUser);
router.get('/unBlock/:id',userController.unBlockUser);
router.delete('/delete/:id',userController.deleteUser);


module.exports = router;