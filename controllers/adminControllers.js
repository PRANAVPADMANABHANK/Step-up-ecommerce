const Admin = require("../models/adminSchema");
const Category = require("../models/categorySchema");
const Order = require("../models/orderSchema");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const jsPDF = require('jspdf');




exports.getDashboard = async (req, res) => {
    const jsPDF = require('jspdf');
    let adminDetails = req.session.admin;
    const orders = await Order.find({})
      .populate({
        path: 'products.item',
        model: 'Product'
      }).exec();
  
    const totalQuantity = orders.reduce((accumulator, order) => {
      order.products.forEach((product) => {
        accumulator += product.quantity;
      });
      return accumulator;
    }, 0);
    const totalProfit = orders.reduce((acc, order) => {
      return acc + order.totalAmount;
    }, 0);
    const totalShipped = orders.reduce((accumulator, order) => {
      order.products.forEach((product) => {
        if (product.deliverystatus === "shipped") {
          accumulator += 1;
        }
      });
      return accumulator;
    }, 0);
    const totalCancelled = orders.reduce((accumulator, order) => {
      order.products.forEach((product) => {
        if (product.orderstatus === "cancelled") {
          accumulator += 1;
        }
      });
      return accumulator;
    }, 0);
  
    console.log(orders, 'order details')
  
  
  
  
    const startOfYear = new Date(new Date().getFullYear(), 0, 1); // start of the year
    const endOfYear = new Date(new Date().getFullYear(), 11, 31); // end of the year
  
    let orderBasedOnMonths = await Order.aggregate([
      // match orders within the current year
      { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
  
      // group orders by month
      {
        $group: {
          _id: { $month: "$createdAt" },
          orders: { $push: "$$ROOT" }
        }
      },
  
      // project the month and orders fields
      {
        $project: {
          _id: 0,
          month: "$_id",
          orders: 1
        }
      },
      {
        $project: {
          month: 1,
          orderCount: { $size: "$orders" }
        }
      }
      , {
        $sort: { month: 1 }
      }
    ]);
  
    console.log(orderBasedOnMonths, 'vall')
  
  
  
    // console.log(totalQuantity,totalProfit,totalShipped,totalCancelled,'ordercount')
    res.render('admin/dashboard', { admin: true, adminDetails, totalQuantity, totalProfit, totalShipped, totalCancelled, orderBasedOnMonths, jsPDF: jsPDF });
  }


exports.adminLogin = async (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/dashboard");
  } else {
    const adminErr = req.session.adminErr;
    req.session.adminErr = false;
    res.render("admin/login", { other: true, login: adminErr });
  }
};

exports.postAdminLogin = async (req, res) => {
  console.log("jasdhkjh");
  console.log(req.body.username);
  console.log(req.body.password);

  try {
    const existingAdmin = await Admin.findOne({ email: req.body.username });
    if (existingAdmin) {
      bcrypt
        .compare(req.body.password, existingAdmin.password)
        .then((status) => {
          if (status) {
            console.log("admin exist ");
            req.session.admin = existingAdmin;
            req.session.admin.loggedIn = true;
            res.redirect("/admin/dashboard");
          } else {
            console.log("password is not matching");
            req.session.adminErr = "password is not matching";
            res.redirect("/admin/adminLogin");
          }
        });
    } else {
      console.log("not valid email");
      req.session.adminErr = "not valid email";
      res.redirect("/admin/adminLogin");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/adminLogin");
};

exports.addCategory = async (req, res) => {
  if (req.session.admin) {
    const category_data = await Category.find();

    res.render("admin/addCategory", { category: category_data, admin: true });
  } else {
    res.redirect("admin/adminLogin");
  }
};

exports.addCategoryPost = async (req, res) => {
  try {
    const category_data = await Category.find();
    if (category_data.length > 0) {
      let checking = false;
      for (let i = 0; i < category_data.length; i++) {
        if (
          category_data[i]["category"].toLowerCase() === req.body.category.toLowerCase()
        ) {
          checking = true;
          break;
        }
      }
      if (checking == false) {
        let category = new Category({
          category: req.body.category,
          description: req.body.description,
        });

        const cart_data = await category.save();
        res.redirect("addCategory");
        console.log("new category added");
        // res.send('Category added successfully');
      } else {
        res.redirect("addCategory");
        console.log("category already exist");
        // res.status(200).send({success:true, msg: "This category ("+req.body.category+")is already exists."})
      }
    } else {
      const category = new Category({
        category: req.body.category,
        description: req.body.description,
      });
      await category.save();
      console.log("newcategory");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.Orders = async (req, res) => {
  let userId = req.session.user;
  try {
    // let orders =await Order.findOne({})
    // let orders = await Order.aggregate([
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "products.item",
    //       foreignField: "_id",
    //       as: "productInfo",
    //     },
    //   },
    // ]);

    // Now each object in the `products` array of each order will contain the product details
    // in addition to the item id and quantity.


    let orders = await Order.find()
   .populate({
     path: 'userId',
     model: 'User',
     select: 'name email' // select the fields you want to include from the User document
   })
   .populate({
     path: 'products.item',
     model: 'Product'
   })
   .exec();


   res.locals.orders = orders;

   console.log(orders,"all orders");
   

    res.render("admin/OrderList", { admin: true });
  } catch (error) {
    console.log(error);
  }
};


exports.orderDetailsAdmin = async(req,res)=>{
  console.log(req.body,'selected ')
  
 let productId = req.query.productId
 let orderId = req.query.orderId;
 console.log(productId,"proId")
 console.log(orderId,"ordId")
  const deliveryStatus = req.body.deliveryStatus;
  console.log(deliveryStatus)

  let orders = await Order.find({ _id: orderId })
  .populate({
    path: 'products.item',
    model: 'Product'
  }).exec();

  console.log(orders,"ord")

  let product = null;
  for (let i = 0; i < orders.length; i++) {
    let order = orders[i];
    product = order.products.find(product => product.item._id.toString() === productId);
    console.log(product,"products found")
    if (product) {
      if(deliveryStatus == 'cancelled'){
       product.orderstatus = deliveryStatus;
       product.deliverystatus = deliveryStatus;
      }else{
       product.orderstatus = 'confirmed';
       product.deliverystatus = deliveryStatus;
      }
    
      await order.save();
      break; // Exit the loop once product is found
    }
  }

  res.redirect('/admin/orders')
}


exports.salesSummary = async(req,res)=>{
  let adminDetails = req.session.admin;
  let orders = await Order.find()
  .populate({
    path: 'userId',
    model: 'User',
    select: 'name email' // select the fields you want to include from the User document
  })
  .populate({
    path: 'products.item',
    model: 'Product'
  })
  .exec();

  if(req.session.admin.orderThisWeek){
    res.locals.orders = req.session.admin.orderThisWeek;
    req.session.admin.orderThisWeek = null;
  }else if(req.session.admin.orderThisMonth){
   res.locals.orders = req.session.admin.orderThisMonth;
   req.session.admin.orderThisMonth = null;
  }else if( req.session.admin.orderThisDay){
   res.locals.orders = req.session.admin.orderThisDay;
   req.session.admin.orderThisDay = null;
  }else if( req.session.admin.orderThisYear){
   res.locals.orders = req.session.admin.orderThisYear;
   req.session.admin.orderThisYear = null;
  }else{
   res.locals.orders = orders;
  }
  console.log(orders,'sales reprot order summaryu')
  res.render('admin/salesReport',{admin:true,adminDetails})
}


exports.salesReport = async(req,res)=>{
  console.log(req.body.selector,'report body ')
  const selector = req.body.selector;

  // Extracting the relevant parts based on the selector
    let year, month, weekStart, weekEnd, day;
    if (selector.startsWith('year')) {
      year = parseInt(selector.slice(5));
       } else if (selector.startsWith('month')) {
         const parts = selector.split('-');
         year = parseInt(parts[1]);
         month = parseInt(parts[2]);
       } else if (selector.startsWith('week')) {
          const today = new Date();
           weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
           weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
          console.log(weekStart,'weekstart')
          console.log(weekEnd,'weekEnd')

      } else if (selector.startsWith('day')) {
          day = new Date(selector.slice(4));
          day.setHours(0, 0, 0, 0);
       }

 
      if (weekStart && weekEnd) {
        const orderThisWeek = await Order.find({ createdAt: { $gte: weekStart, $lte: weekEnd } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
        .populate({
          path: 'products.item',
          model: 'Product'
        })
        .exec();;
        req.session.admin.orderThisWeek =orderThisWeek;
        console.log(orderThisWeek, 'details of this week');
        return res.redirect('/admin/sales-report')
      
      }

      if (year && month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const orderThisMonth = await Order.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
        .populate({
          path: 'products.item',
          model: 'Product'
        })
        .exec();;
        req.session.admin.orderThisMonth =orderThisMonth;
        console.log(orderThisMonth, 'details of this month');
        return res.redirect('/admin/sales-report')
      
      }
      
      if (day) {
        const startOfDay = new Date(day);
        const endOfDay = new Date(day);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setSeconds(endOfDay.getSeconds() - 1);
        const orderThisDay = await Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
        .populate({
          path: 'products.item',
          model: 'Product'
        })
        .exec();;
        req.session.admin.orderThisDay =orderThisDay;
        console.log(orderThisDay, 'details of this day');
        return res.redirect('/admin/sales-report')

      }
      if (year) {
        const orderThisYear = await Order.find({ createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) } }).populate({
          path: 'userId',
          model: 'User',
          select: 'name email' // select the fields you want to include from the User document
        })
        .populate({
          path: 'products.item',
          model: 'Product'
        })
        .exec();;
        req.session.admin.orderThisYear =orderThisYear;
        console.log(orderThisYear,'details of this year')
        return res.redirect('/admin/sales-report')
       
      }
      
      
}