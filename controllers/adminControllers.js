const Admin = require("../models/adminSchema");
const Category = require("../models/categorySchema");
const Order = require("../models/orderSchema");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

exports.getDashboard = async (req, res) => {
  let adminDetails = req.session.admin;
  res.render("admin/dashboard", { admin: true, adminDetails });
};

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
    let orders = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "products.item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
    ]);

    // Now each object in the `products` array of each order will contain the product details
    // in addition to the item id and quantity.

    console.log(orders);
   

    res.render("admin/OrderList", { admin: true, orders });
  } catch (error) {
    console.log(error);
  }
};
