const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Product = require('../models/productSchema');




exports.sortOrders = async(req,res)=>{
    console.log(req.body,'afadsf')
    const userId = req.session.user._id;
    const selectedYear = req.body.selector;

    const startDate = new Date(selectedYear, 0, 1); // January 1st of selected year
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999); // December 31st of selected year
    console.log(startDate,"\\\\\\\\\\")
    console.log(endDate,"????????????")
    
    // Find all orders of the user that were created between the start and end dates of the selected year
    const orders = await Order.find({
      userId: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
    console.log(orders,'sorted date');
    if(orders){
      req.session.filterOrders = orders
      console.log("got 2023")
    }else{
      req.session.noOrders = 'no item founded'
      console.log("got null")
    }
    res.redirect('/orders')
}

exports.cancelOrder =async(req,res)=>{
 
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId,orderId,'first pro second order')
  
    let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
  
    let product = null;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      product = order.products.find(product => product.item._id.toString() === productId);
      if (product) {
        product.orderstatus = 'cancelled';
        product.deliverystatus ='cancelled';
        await order.save();
        break; // Exit the loop once product is found
      }
    }
    console.log(orders,'total')
    console.log(product,'igot the product')
    res.redirect('/orders')
  
  }


  exports.returnOrder = async(req,res)=>{
     
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId,orderId,'first pro second order')
  
    let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
  
    let product = null;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      product = order.products.find(product => product.item._id.toString() === productId);
      if (product) {
        product.orderstatus = 'returned';
        product.deliverystatus ='returned';
        await order.save();
        break; // Exit the loop once product is found
      }
    }
    console.log(orders,'total')
    console.log(product,'igot the product')
    res.redirect('/orders')
  }

  exports.listOfNotShippedOrder = async(req,res)=>{
    let orders = await Order.find({
      userId: req.session.user._id,
      'products.deliverystatus': 'not-shipped',
      'products.orderstatus': 'processing'
  
    }).populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
    req.session.notShippedOrders = orders
    res.redirect('/orders')
  }

  exports.listOfCancelledOrder = async(req,res)=>{
    let orders = await Order.find({
      userId: req.session.user._id,
      'products.orderstatus': 'cancelled'
    }).populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
    req.session.cancelledOrders = orders
    res.redirect('/orders')
  
  }

  exports.listOfReturnedOrder =async(req,res)=>{
      
    let orders = await Order.find({
      userId: req.session.user._id,
      'products.orderstatus': 'returned'
    }).populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
    req.session.returneddOrders = orders
    res.redirect('/orders')
  
  }

  exports.invoice = async(req,res)=>{
  
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId,orderId,'first pro second order')
  
    let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
  
    console.log(orders,'total')
  
  
    let product = null;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      product = order.products.find(product => product.item._id.toString() === productId);
      if (product) {
        // If product found, fetch the details from the Product model
        break; // Exit the loop once product is found
      }
    }
    
  
    console.log(product,'particluar')
    console.log(orders,'total')
  
     res.render('user/invoice',{orders,product,user: req.session.user,other:true});
  }