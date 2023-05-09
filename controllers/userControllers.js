// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Cart = require("../models/cartSchema");
const Category = require("../models/categorySchema");
const SubCategory = require("../models/subCategorySchema");
const Address = require("../models/addressSchema");
const Order = require("../models/orderSchema");
const Banner = require("../models/bannerSchema");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const OTP = require("../models/otpSchema");
const Admin = require("../models/adminSchema");
const mongoose = require("mongoose");

const flash = require("connect-flash");
const { success } = require("toastr");
const { json } = require("body-parser");
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");
const ObjectId = mongoose.Types.ObjectId;

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});

exports.cartCount = async (req, res, next) => {
  try {
    let user = req.session.user;

    let cartCount = 0;
    if (user) {
      const cart = await Cart.findOne({ userId: user._id }); // Await the query to get the cart object

      if (cart) {
        // Replace cart.products.length with cart.products.reduce((acc, product) => acc + product.quantity, 0)
        cartCount = cart.products.reduce(
          (acc, product) => acc + product.quantity,
          0
        );
        console.log(cartCount);
      }
    }
    req.cartCount = cartCount;
    // res.locals.cartCount = cartCount; // Set cartCount as a property on req object

    next();
  } catch (error) {
    console.log(error);
  }
};

exports.userProfile = async (req, res) => {
  let currentAddress = await User.findOne({ _id: req.session.user._id });
  let user = req.session.user;
  // Access cartCount value from req object
  const cartCount = req.cartCount;
  console.log(cartCount, "hello");

  res.render("user/userprofile", {
    currentAddress,
    video: true,
    user,
    cartCount,
  });
};

exports.editUserProfile = async (req, res) => {
  console.log(req.body, "userr");
  const userProfile = await User.findOneAndUpdate(
    { _id: req.params.id }, // filter object
    { name: req.body.name, email: req.body.email, mobile: req.body.phone } // update object
  );
  res.redirect("/profile");
};

exports.updateUserAddress = async (req, res) => {
  console.log(req.body.userId, "idddd");
  let user = req.session.user;
  const address = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $push: {
        address: {
          name: req.body.name,
          mobile: req.body.mobile,
          addressDetails: req.body.addressDetails,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          typeOfAddress: req.body.typeOfAddress,
        },
      },
    },
    { new: true }
  );
  console.log(address, "address");
  res.json(address);
};

exports.deleteUserAddress = async (req, res) => {
  try {
    let user = req.session.user;
    await User.findByIdAndUpdate(
      { _id: user._id },
      { $pull: { address: { _id: req.params.id } } },
      { new: true }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
  }
};

exports.addressEdit = (req, res) => {
  const { addressId, ...formData } = req.body;
  console.log(addressId);
  console.log(formData);
  try {
  } catch (error) {}
};

exports.confirmAndUpdatePassword = async (req, res) => {
  let verifiedUser = await User.findOne({ _id: req.session.user._id });

  bcrypt
    .compare(req.body.currentpassword, verifiedUser.password)
    .then(async (status) => {
      if (status) {
        let hashPassword = await bcrypt.hash(req.body.newpassword, 10);

        await User.findOneAndUpdate(
          { _id: req.session.user._id }, // filter object
          { password: hashPassword } // update object
        );

        console.log("huihadsfasdfasd");
        res.json(true);
      } else {
        console.log("password is not matching");

        res.json({ message: "not matching" });
      }
    });
};

exports.indexPage = async (req, res) => {
  let user = req.session.user;

  // Access cartCount value from req object
  const cartCount = req.cartCount;

  res.render("user/index", { cartCount, other: true, user });
};

exports.userSignup = async (req, res) => {
  res.render("user/User_Signup", { other: true });
};

exports.userHome = async (req, res) => {
  try {
    res.render("user/index", { other: true });
  } catch (error) {
    console.log(error);
  }
};

exports.getShop = async (req, res) => {
  try {
    let user = req.session.user;
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    const categories = await Category.find();
    const subcategories = await SubCategory.find();

    res.render("user/shop", {
      user,
      cartCount,
      video: true,
      categories,
      subcategories,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.homePage = async (req, res) => {
  try {
    // const pageNum = req.query.page
    // console.log(pageNum,"selected page")
    // const perPage = 4

    // req.session.tempUser = null;
    // let user = req.session.user;

    // const products = await Product.find({ type: "Men's" , deleted: false }).skip((pageNum-1)*perPage).limit(perPage);

    const pageNum = parseInt(req.query.page) || 1;
    console.log(pageNum, "selected page");
    const perPage = 4;

    req.session.tempUser = null;
    let user = req.session.user;

    const count = await Product.countDocuments({
      type: "Men's",
      deleted: false,
    });
    const pages = Math.ceil(count / perPage);

    const products = await Product.find({ type: "Men's", deleted: false })
      .skip((pageNum - 1) * perPage)
      .limit(perPage);

    const categories = await Category.find();
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    console.log(cartCount, "hello");
    console.log(products);

    // let banner =await Banner.find({})
    // console.log(banner,"///////???????")
    // console.log(products)
    res.render("user/men", {
      products,
      user,
      cartCount,
      categories,
      pageNum: pageNum,
      perPage: perPage,
      count: count,
      pages: pages,
    
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getWomenPage = async (req, res) => {
  // const products = await Product.find({ type: "Women's", deleted: false });
  let user = req.session.user;
  // console.log(products);

  const pageNum = parseInt(req.query.page) || 1;
  console.log(pageNum, "selected page");
  const perPage = 4;

  const count = await Product.countDocuments({
    type: "Women's",
    deleted: false,
  });

  const pages = Math.ceil(count / perPage);

  const products = await Product.find({ type: "Women's", deleted: false })
    .skip((pageNum - 1) * perPage)
    .limit(perPage);

  // Access cartCount value from req object
  const cartCount = req.cartCount;

  res.render("user/women", {
    products,
    user,
    cartCount,
    pageNum: pageNum,
    perPage: perPage,
    count: count,
    pages: pages,
  });
};

exports.getKidsPage = async (req, res) => {
  let user = req.session.user;

  const pageNum = parseInt(req.query.page) || 1;
  console.log(pageNum, "selected page");
  const perPage = 4;

  // const products = await Product.find({
  //   type: "Baby's & Kid's",
  //   deleted: false,
  // });

  const count = await Product.countDocuments({
    type: "Baby's & Kid's",
    deleted: false,
  });

  const pages = Math.ceil(count / perPage);

  const products = await Product.find({
    type: "Baby's & Kid's",
    deleted: false,
  })
    .skip((pageNum - 1) * perPage)
    .limit(perPage);

  // Access cartCount value from req object
  const cartCount = req.cartCount;

  res.render("user/kids", {
    products,
    user,
    cartCount,
    pageNum: pageNum,
    perPage: perPage,
    count: count,
    pages: pages,
  });
};

exports.addtoCart = async (req, res) => {
  const productId = new ObjectId(req.params.id);
  const userId = req.session.user._id; // we will get user id here
  console.log(productId);
  console.log(userId);
  console.log(req.query.size, "size");
  let proPrice = await Product.findOne({ _id: req.params.id });
  let taxAmount = Math.floor((proPrice.price / 100) * 12);
  console.log(taxAmount, "taxxxxxxxxxxx");
  console.log(proPrice, "proPrice");

  console.log("worked");
  try {
    const quantity = 1;
    let proObj = {
      item: productId,
      quantity: quantity,
      currentPrice: proPrice.price,
      tax: taxAmount,
      size: req.query.size,
      deliverystatus: "not-shipped",
      orderstatus: "processing",
    };
    let userCart = await Cart.findOne({ userId: new ObjectId(userId) });
    console.log(userCart, "🔥🔥🔥🔥🔥");
    let cartCheckProId = req.params.id;
    if (userCart) {
      let proExist = userCart.products.findIndex(
        (product) =>
          product.item == cartCheckProId && product.size === req.query.size
      );
      console.log(proExist);
      if (proExist > -1) {
        await Cart.updateOne(
          { userId, "products.item": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
      } else {
        await Cart.updateOne({ userId }, { $push: { products: proObj } });
      }
    } else {
      const cartObj = new Cart({
        userId: userId,
        products: [proObj],
      });
      console.log(cartObj);
      await Cart.create(cartObj);
    }
    console.log("working");
    res.json(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

exports.productSizeSelector = async (req, res) => {
  let proId = req.query.proId;
  console.log(proId, "product id");
  if (req.session.user) {
    let cartItem = await Cart.findOne({
      user: req.session.user._id,
      products: {
        $elemMatch: {
          size: req.params.id,
          item: proId,
        },
      },
    });
    console.log(cartItem, "valeu");
    if (cartItem) {
      return res.json(true);
    } else {
      return res.json(false);
    }
  } else {
    res.redirect("/login");
  }
};

exports.getCartProducts = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  userId = userId.toString();

  console.log(userId, "user");
  let cartItems = [];
  try {
    cartItems = await Cart.aggregate([
      {
        $match: { userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          quantity: "$products.quantity",
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          unique_id: "$products._id",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          unique_id: 1,
          item: 1,
          quantity: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
    ]);
    console.log(cartItems, "cartItemssss");

    let total = await Cart.aggregate([
      {
        $match: { userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          quantity: "$products.quantity",
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,
          totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
          total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
          // total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
        },
      },
    ]);

    console.log(total, "loooooooooooooooooo");

    console.log(cartItems, "cart");
    console.log(total, "dispak");
    let subtotal = 0;
    let tax = 0;
    let totalWithTax = 0;
    if (total.length > 0) {
      subtotal = total[0].total;
      tax = total[0].totalTax;
      totalWithTax = total[0].totalWithTax;
    }
    console.log(total, "....");

    // let result = await Cart.aggregate([
    //   {
    //     $match: { userId }, // Replace 'userId' with the actual field that represents the user ID
    //   },
    //   {
    //     $unwind: "$products",
    //   },
    //   {
    //     $project: {
    //       item: { $toObjectId: "$products.item" },
    //       quantity: "$products.quantity",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "item",
    //       foreignField: "_id",
    //       as: "productInfo",
    //     },
    //   },
    //   {
    //     $project: {
    //       item: 1,
    //       quantity: 1,
    //       productInfo: { $arrayElemAt: ["$productInfo", 0] },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       item: 1,
    //       quantity: 1,
    //       total: { $multiply: ["$quantity", "$productInfo.price"] },
    //     },
    //   },
    // ]);

    // console.log(cartItems,'cartItemssst')
    // console.log(total[0].total,'total got')
    // console.log(result, "result got");
    // console.log(result[0].total, "result got");
    // console.log(result[1].total, "result got");

    // Access cartCount value from req object
    const cartCount = req.cartCount;

    res.render("user/Cart", {
      cartItems,
      user,
      video: true,
      cartCount,
      cartIcon: true,
      total,
      subtotal,
      tax,
      totalWithTax,
      // result,
    });
  } catch (error) {
    console.log(error, "helooooo");
  }
};

exports.changeProductQuantity = async (req, res) => {
  // const { product, cart, count, quantity } = req.body;
  // const parsedCount = parseInt(count);
  // const parsedQuantity = parseInt(quantity);
  // console.log(parsedQuantity);
  // const cartId = cart;
  // const productId = product;
  // // Convert cartId to ObjectId
  // const objectIdCartId = new ObjectId(cartId);
  // const objectIdproductId = new ObjectId(productId);

  try {
    // console.log("inside the try");
    // console.log("parsedCount:", parsedCount);
    // console.log("parsedQuantity:", parsedQuantity);
    // console.log("objectIdCartId:", objectIdCartId);
    // console.log("objectIdproductId:", objectIdproductId);

    // let cart = await Cart.findOne({});
    // let userId = cart.userId;
    // console.log(userId);
    // let userId = req.session.user._id;
    const response = {};
    let cart = req.body.cart;
    console.log(cart, "...........");
    let count = req.body.count;
    let quantity = req.body.quantity;
    let unique_id = new ObjectId(req.body.product);
    count = parseInt(count);
    quantity = parseInt(quantity);
    console.log(count, "//////////");
    console.log(quantity, "??????????");

    if (count == -1 && quantity == 1) {
      await Cart.updateOne(
        {
          _id: req.body.cart,
          "products._id": unique_id,
        },
        {
          $pull: { products: { _id: unique_id } },
        }
      );

      res.json({ removeProduct: true });
    } else {
      await Cart.updateOne(
        { _id: req.body.cart, "products._id": unique_id },
        { $inc: { "products.$.quantity": count } }
      );

      let total = await Cart.aggregate([
        {
          $match: { user: req.session.userId },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: { $toObjectId: "$products.item" },
            size: "$products.size",
            currentPrice: "$products.currentPrice",
            tax: "$products.tax",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $project: {
            item: 1,
            size: 1,
            currentPrice: 1,
            tax: 1,
            quantity: 1,
            productInfo: { $arrayElemAt: ["$productInfo", 0] },
          },
        },
        {
          $group: {
            _id: null,

            totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
            total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
            totalWithTax: {
              $sum: {
                $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
              },
            },
          },
        },
      ]);

      console.log(total, "////////");
      // response.status = true;
      res.json({ success: true, total });
      console.log("else worked");
    }
    // let total = await Cart.aggregate([
    //   {
    //     $match:{user:req.session.userId}
    //   },
    //   {
    //     $unwind:'$products'
    //   },
    //   {
    //     $project:{
    //       item: { $toObjectId: '$products.item' },
    //       size:'$products.size',
    //       currentPrice:'$products.currentPrice',
    //       tax:'$products.tax',
    //       quantity:'$products.quantity'
    //     }
    //   },
    //   {
    //     $lookup:{
    //       from:'products',
    //       localField:'item',
    //       foreignField:'_id',
    //       as:'productInfo'
    //     }
    //   },
    //   {
    //     $project:{

    //       item:1,
    //       size:1,
    //       currentPrice:1,
    //       tax:1,
    //       quantity:1,
    //       productInfo:{$arrayElemAt:['$productInfo',0]}
    //     }
    //   },
    //   {
    //     $group:{
    //       _id:null,

    //           totalTax:{$sum:{$multiply:['$quantity','$tax']}},
    //           total:{$sum:{$multiply:['$quantity','$currentPrice']}},
    //           totalWithTax: { $sum: { $multiply: ['$quantity', { $add: ['$tax', '$currentPrice'] } ] } }

    //     }
    //   }

    // ]);

    // console.log(total)

    //   let total = await Cart.aggregate([
    //     {
    //       $match: { userId: userId },
    //     },
    //     {
    //       $unwind: "$products",
    //     },
    //     {
    //       $project: {
    //         item: { $toObjectId: "$products.item" },
    //         quantity: "$products.quantity",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "products",
    //         localField: "item",
    //         foreignField: "_id",
    //         as: "productInfo",
    //       },
    //     },
    //     {
    //       $project: {
    //         item: 1,
    //         quantity: 1,
    //         productInfo: { $arrayElemAt: ["$productInfo", 0] },
    //       },
    //     },
    //     {
    //       $group: {
    //         _id: null,
    //         total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
    //       },
    //     },
    //   ]).allowDiskUse(true);

    //  console.log(total[0].total)

    //   let subtotal = await Cart.aggregate([
    //     {
    //       $match: {  userId: userId }, // Replace 'userId' with the actual field that represents the user ID
    //     },
    //     {
    //       $unwind: "$products",
    //     },
    //     {
    //       $project: {
    //         item: { $toObjectId: "$products.item" },
    //         quantity: "$products.quantity",
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: "products",
    //         localField: "item",
    //         foreignField: "_id",
    //         as: "productInfo",
    //       },
    //     },
    //     {
    //       $project: {
    //         item: 1,
    //         quantity: 1,
    //         productInfo: { $arrayElemAt: ["$productInfo", 0] },
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: 0,
    //         item: 1,
    //         quantity: 1,
    //         subtotal: { $multiply: ["$quantity", "$productInfo.price"] },
    //       },
    //     },
    //   ]);
    //   console.log(subtotal,"/////////");

    //   // Extract only the subtotal amount for each product
    //   let subtotalAmounts = subtotal.map((item) => item.subtotal);

    //   if (parsedCount === -1 && parsedQuantity === 1) {
    //     console.log("if condition matched");
    //     await Cart.updateOne(
    //       { _id: objectIdCartId },
    //       {
    //         $pull: { products: { item: objectIdproductId } },
    //       }
    //     );

    //     console.log("removed");

    //     res.json({
    //       success: true,
    //       removeProduct: true,
    //       total: total,
    //       subtotalAmounts: subtotalAmounts,
    //       subtotal: subtotal,
    //     }); // Send removeProduct flag as true in the response
    //   } else {
    //     console.log("else condition");
    //     console.log(parsedCount);
    //     await Cart.updateOne(
    //       { _id: objectIdCartId, "products.item": objectIdproductId },
    //       {
    //         $inc: { "products.$.quantity": parsedCount },
    //       }
    //     );
    //   }

    //   //  console.log( req.session.total);
    //   res.json({
    //     success: true,
    //     removeProduct: false,
    //     total: total,
    //     subtotalAmounts: subtotalAmounts,
    //     subtotal: subtotal,
    //   });
  } catch (error) {
    console.error(error);
  }
};

exports.removeItem = async (req, res) => {
  try {
    console.log(req.body.product, "iddunique");
    let unique_id = new ObjectId(req.body.product);
    console.log(req.body.product, "iddunique");
    await Cart.updateOne(
      {
        _id: req.body.cart,
        "products._id": unique_id,
      },
      {
        $pull: { products: { _id: unique_id } },
      }
    );
    // // define the response object and assign it a value
    // const response = { success: true, message: 'Product removed successfully' };

    // // send the response object to the client
    // res.json(response);
    let displayTotal = await Cart.aggregate([
      {
        $match: { user: req.session.userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          quantity: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,

          totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
          total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
        },
      },
    ]);

    let response = {};
    if (displayTotal.length === 0) {
      //  if(req.session.coupon){

      //    let backToTotal = await User.findOne({_id:req.session.user._id},{appliedCoupon:1})
      //    let minPurchase=backToTotal.appliedCoupon[0].minPurchase

      //      response.couponApplied =null;

      //      await User.updateOne(
      //        { _id: req.session.user._id },
      //        { $pull: { appliedCoupon: { status: false } } }
      //      );
      //       req.session.couponStatus = null;
      //      req.session.coupon = null;

      //  }
      response.subtotal = 0;
      response.tax = 0;
      response.totalWithTax = 0;
      await res.json(response);
    } else {
      let subtotal = displayTotal[0].total;
      let tax = displayTotal[0].totalTax;
      let totalWithTax = displayTotal[0].totalWithTax;
      // if(req.session.coupon){

      //   let backToTotal = await User.findOne({_id:req.session.user._id},{appliedCoupon:1})
      //   let minPurchase=backToTotal.appliedCoupon[0].minPurchase
      //   if(minPurchase<=displayTotal[0].total)
      //   {
      //     response.couponApplied =req.session.coupon;
      //   }else{
      //     await User.updateOne(
      //       { _id: req.session.user._id },
      //       { $pull: { appliedCoupon: { status: false } } }
      //     );
      //      req.session.couponStatus = null;
      //     req.session.coupon = null;
      //   }
      // }
      response.subtotal = subtotal;
      response.tax = tax;
      response.totalWithTax = totalWithTax;

      await res.json(response);
    }
  } catch (error) {
    console.log(error);
  }

  // console.log("remove cart here");

  // const { cart, product, confirmResult } = req.body; // Retrieve confirmResult from req.body
  // console.log(cart);
  // console.log(product);
  // const objectIdCartId = new ObjectId(cart);
  // const objectIdProductId = new ObjectId(product);
  // console.log(objectIdCartId);
  // console.log(objectIdProductId);
  // try {
  //   console.log("inside try");
  //   // Update cart in the database only if user confirmed the removal
  //   if (confirmResult) {
  //     await Cart.findByIdAndUpdate(objectIdCartId, {
  //       $pull: { products: { item: objectIdProductId } },
  //     });
  //     console.log("pulled");
  //     res.json({ success: true, removeProduct: true });
  //   } else {
  //     res.json({ success: false, removeProduct: false });
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
};

// exports.removeItem = async (req, res) => {
//   console.log("remove cart here");

//   const { cart, product } = req.body;
//   console.log(cart);
//   console.log(product);
//   const objectIdCartId = new ObjectId(cart);
//   const objectIdProductId = new ObjectId(product);
//   console.log(objectIdCartId);
//   console.log(objectIdProductId);
//   try {
//     console.log("inside try");
//     // Update cart in the database only if user confirmed the removal
//     let confirmResult = req.body.confirmResult;
//     if (confirmResult) {
//       await Cart.findByIdAndUpdate(objectIdCartId, { $pull: { products: { item: objectIdProductId } } });
//       console.log("pulled");
//       res.json({ success: true, removeProduct: true });
//     } else {
//       res.json({ success: false, removeProduct: false });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

exports.loginPage = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/User_Login", {
      other: true,
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
};

exports.postSignup = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      console.log(`User with ${req.body.email} already exist`);
      req.session.loginErr = "Email is already exist";
      res.redirect("/signup");
      console.log("user already exist with this email");
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        mobile: req.body.mobile,
        status: false,
        isActive: true,
      });
      User.create(newUser);
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};

exports.postLogin = async (req, res) => {
  try {
    const newUser = await User.findOne({ email: req.body.email });
    console.log(newUser);
    if (newUser) {
      console.log("klasjdlfkj");
      bcrypt.compare(req.body.password, newUser.password).then((status) => {
        if (status) {
          if (newUser.isActive) {
            console.log("user exist");
            req.session.user = newUser;
            req.session.user.loggedIn = true;
            console.log(newUser);
            res.redirect("/");
          } else {
            req.session.loginErr = "User has been blocked";
            console.log("User has been blocked");
            res.status(400).redirect("/login");
          }
        }
      });
    } else {
      req.session.loginErr = "Invalid Email or Password";
      console.log("password is not matching");
      res.status(400).redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.otpLogin = async (req, res) => {
  try {
    const number = req.body.number;
    const actualNumber = "+91" + number;

    //generate random 6 digit number between 1-9
    let randomNumber = Math.floor(Math.random() * 908800) + 100000;

    //send random numbers to users number (twilio)
    client.messages
      .create({ body: randomNumber, from: "+14752628418", to: actualNumber })
      .then(otpfun());

    //save random Number to database then renders verify page
    async function otpfun() {
      const newUser = new OTP({
        users: req.body.number,
        otp: randomNumber,
      });
      await OTP.create(newUser);
    }
    res.render("user/verify", { other: true });

    // function saveUser() {

    //   console.log(newUser)
    //   newUser
    //     .save()
    //     .then(() => {
    //       res.render("user/verify");
    //     })
    //     .catch((err) => {
    //       console.log("error generating number", err);
    //     });
    // }
  } catch (error) {
    console.log(error);
  }
};

exports.verify = async (req, res) => {
  res.render("user/verify", { other: true });
};
exports.postVerify = (req, res) => {
  const code = req.body.code;
  console.log(req.body.code);
  console.log("heyyyyyy");
  // OTP.findOne({ users: code }, (err, found) => {
  //   if (err) {
  //     res.render("error");
  //   } else if (found) {
  //     res.render("user/success");
  //   } else {
  //     res.render("user/error");
  //   }

  OTP.findOne({ otp: code }).then((found) => {
    if (found) {
      console.log("success");
      res.render("user/success", { other: true });
    } else {
      console.log("error");
      res.render("user/error", { other: true });
    }
  });
  console.log("jksadhfkjhkjsadfhkjhsadkjf");

  OTP.findOneAndDelete({ otp: code })
    .exec()
    .then((result) => {
      console.log("deleted");
    })
    .catch((err) => {
      console.log(err);
    });
};

//   OTP.findOneAndDelete({ users: code }, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("deleted");
//     }
//   });
// }

// exports.otpSuccess = (req, res) => {
//   res.render("user/success", { other: true });
// };
// exports.otpError = (req, res) => {
//   res.render("user/error", { other: true });
// };

//admin side user controller

exports.userslist = async (req, res) => {
  try {
    let adminDetails = req.session.admin;
    const userList = await User.find({});
    console.log(userList, "userList");
    res.render("admin/userListView", { userList, admin: true, adminDetails });
  } catch (error) {
    console.log(error);
  }
};

//admin side user management below

exports.blockUser = async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { isActive: false });
  req.flash("success", "User blocked successfully!");
  res.redirect("/admin/userListView");
};
exports.unBlockUser = async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { isActive: true });
  req.flash("success", "User unblocked successfully!");
  res.redirect("/admin/userListView");
};

exports.deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });

    res.redirect("/admin/userListView");
  } catch (error) {
    console.log(error);
  }
};

exports.userSingleProduct = async (req, res) => {
  try {
    let id = req.params.id;
    let objId = new ObjectId(id);

    let singleProduct = await Product.findOne({ _id: objId });
    let user = req.session.user;

    // Access cartCount value from req object
    const cartCount = req.cartCount;

    res.render("user/userSingleProduct", {
      singleProduct,
      user,
      video: true,
      cartCount,
    }); //passing the singleProduct values while rendering the page...
  } catch (error) {
    console.log(error);
  }
};

exports.isLogin = async (req, res, next) => {
  try {
    let user = req.session.user;
    if (user) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.deliveryAddress = async (req, res) => {
  let user = req.session.user;
  console.log(user, "id found");
  let userId = req.session.user._id;
  userId = userId.toString();

  const addressData = await Address.find({ user: user._id });
  console.log(addressData);
  const address = addressData[0].address;
  console.log(address, "address found");

  console.log(userId, "user");

  try {
    // let total = await Cart.aggregate([
    //   {
    //     $match: { userId },
    //   },
    //   {
    //     $unwind: "$products",
    //   },
    //   {
    //     $project: {
    //       item: { $toObjectId: "$products.item" },
    //       quantity: "$products.quantity",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "item",
    //       foreignField: "_id",
    //       as: "productInfo",
    //     },
    //   },
    //   {
    //     $project: {
    //       item: 1,
    //       quantity: 1,
    //       productInfo: { $arrayElemAt: ["$productInfo", 0] },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
    //     },
    //   },
    // ]);
    cartItems = await Cart.aggregate([
      {
        $match: { userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          quantity: "$products.quantity",
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          unique_id: "$products._id",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          unique_id: 1,
          item: 1,
          quantity: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
    ]);
    console.log(cartItems, "cartItemssss");

    let total = await Cart.aggregate([
      {
        $match: { user: req.session.userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          quantity: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,

          totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
          total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
        },
      },
    ]);

    // Store the total value in a session variable
    // req.session.total = total[0].total;

    console.log(total, "cart got");
    res.render("user/address", {
      video: true,
      cartIcon: true,
      user,
      total,
      address,
      cartItems,
    });
  } catch (error) {
    console.log(error);
  }
};

// exports.savedAddressget = async (req,res)=>{
//   let user = req.session.user
//   console.log(user,'user here')
//    // Access cartCount value from req object
//    const cartCount = req.cartCount;
//    const addressData  = await Address.find()
//    const address = addressData[0].address;

//    console.log(address,"address got")
//   try {
//     res.render('user/savedAddress',{video:true,user,cartCount,address})
//   } catch (error) {
//     console.log(error)
//   }
// }

exports.savedAddressget = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  userId = userId.toString();
  console.log(user, "user here");

  const cartCount = req.cartCount;
  const addressData = await Address.find({ user: user._id });

  if (addressData && addressData.length > 0) {
    const address = addressData[0].address;
    console.log(address, "address got");

    try {
      res.render("user/savedAddress", {
        video: true,
        user,
        cartCount,
        address,
      });
    } catch (error) {
      console.log(error);
    }
    json(true);
  } else {
    console.log("No address data found");
    res.render("user/savedAddress", {
      video: true,
      user,
      cartCount,
      address: [],
    });
  }
  // Clear any existing session data for address
  req.session.address = null;
};

exports.editSavedAddressPost = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.params.id;

    console.log(userId);
    console.log(addressId);

    const user = await Address.findOne({ user: userId });

    const address = user.address.find((a) => a._id.toString() === addressId);
    console.log(address, "address got");

    const updatedAddress = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      state: req.body.state,
      streetaddress: req.body.address,
      appartment: req.body.appartment,
      town: req.body.town,
      zip: req.body.postcode,
      mobile: req.body.mobile,
      email: req.body.email,
      radio: req.body.optradio,
    };

    const result = await Address.updateOne(
      { user: userId, "address._id": new ObjectId(addressId) },
      { $set: { "address.$": updatedAddress } }
    );

    console.log(result);
    res.redirect("/savedAddress");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressId = req.params.id;

    const result = await Address.updateOne(
      { user: userId },
      { $pull: { address: { _id: new ObjectId(addressId) } } }
    );

    console.log(result);
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.savedAddressPost = async (req, res) => {
  let user = req.session.user._id;
  console.log(user, "user found");
  console.log(req.body);
  let addaddress = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    state: req.body.state,
    streetaddress: req.body.address,
    appartment: req.body.appartment,
    town: req.body.town,
    zip: req.body.postcode,
    mobile: req.body.mobile,
    email: req.body.email,
    radio: req.body.optradio,
  };
  try {
    const data = await Address.findOne({ user: user });
    if (data) {
      data.address.push(addaddress);
      const updated_data = await Address.findOneAndUpdate(
        { user: user },
        { $set: { address: data.address } },
        { returnDocument: "after" }
      );
      console.log(updated_data, "updated address collection");
    } else {
      const address = new Address({
        user: req.session.user._id,
        address: [addaddress],
      });
      const address_data = await address.save();
      console.log(address_data, "address collection");
    }

    res.json(true);
  } catch (error) {
    console.log(error);
  }
};

exports.editSavedAddress = async (req, res) => {
  try {
    let user = req.session.user;
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    console.log(req.params.id); // Check if id is coming in params
    const address = await Address.findOne({ "address._id": req.params.id });
    // Check if address is coming or not
    // if (!address) {
    //   return res.status(404).send("Address not found");
    // }
    const selectedAddress = address.address.find(
      (addr) => addr._id.toString() === req.params.id
    );
    console.log(selectedAddress, "selectedAddress");
    res.render("user/editSavedAddress", {
      video: true,
      user,
      cartCount,
      address: selectedAddress,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deliveryAddressPost = async (req, res) => {
  let orders = req.body;
  console.log(orders);
  let cod = req.body["payment-method"];
  console.log(cod);

  let addressId = new mongoose.Types.ObjectId(req.body.address);

  console.log(addressId);

  try {
    const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );
    console.log(addressDetails);

    let filteredAddress = addressDetails.address[0];
    console.log(filteredAddress);
    console.log(filteredAddress.firstname);

    let cart = await Cart.findOne({ userId: req.session.user._id });
    let userId = req.session.user._id;
    console.log(cart, userId);

    // let total = await Cart.aggregate([
    //   {
    //     $match: { userId: userId },
    //   },
    //   {
    //     $unwind: "$products",
    //   },
    //   {
    //     $project: {
    //       item: { $toObjectId: "$products.item" },
    //       quantity: "$products.quantity",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "item",
    //       foreignField: "_id",
    //       as: "productInfo",
    //     },
    //   },
    //   {
    //     $project: {
    //       item: 1,
    //       quantity: 1,
    //       productInfo: { $arrayElemAt: ["$productInfo", 0] },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
    //     },
    //   },
    // ]).allowDiskUse(true);

    let total = await Cart.aggregate([
      {
        $match: { user: req.session.userId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: { $toObjectId: "$products.item" },
          size: "$products.size",
          currentPrice: "$products.currentPrice",
          tax: "$products.tax",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          item: 1,
          size: 1,
          currentPrice: 1,
          tax: 1,
          quantity: 1,
          productInfo: { $arrayElemAt: ["$productInfo", 0] },
        },
      },
      {
        $group: {
          _id: null,

          totalTax: { $sum: { $multiply: ["$quantity", "$tax"] } },
          total: { $sum: { $multiply: ["$quantity", "$currentPrice"] } },
          totalWithTax: {
            $sum: {
              $multiply: ["$quantity", { $add: ["$tax", "$currentPrice"] }],
            },
          },
        },
      },
    ]);

    console.log(cart.products, "nnnnnnnnnnnnnnnnnn");
    // Store the total value in a session variable
    // req.session.total = total[0].total;

    console.log(total[0].totalWithTax, "cart got");
    let status = req.body["payment-method"] === "COD" ? "placed" : "pending";

    let orderObj = new Order({
      deliveryDetails: {
        firstname: filteredAddress.firstname,
        lastname: filteredAddress.lastname,
        state: filteredAddress.state,
        streetaddress: filteredAddress.streetaddress,
        appartment: filteredAddress.appartment,
        town: filteredAddress.town,
        zip: filteredAddress.zip,
        mobile: filteredAddress.mobile,
        email: filteredAddress.email,
        radio: filteredAddress.radio,
      },
      userId: cart.userId,
      paymentMethod: req.body["payment-method"],
      products: cart.products,
      totalAmount: total[0].totalWithTax,
      paymentstatus: status,
      deliverystatus: "not shipped",
      createdAt: new Date(),
    });
    console.log(orderObj);
    let orderDoc = await Order.create(orderObj);
    console.log(orderDoc, "order createad");
    let orderId = orderDoc._id;
    let orderIdString = orderId.toString();
    console.log(orderIdString, "order string");
    // Find and delete the cart items for the user
    await Cart.findOneAndDelete({ userId: cart.userId });
    if (req.body["payment-method"] == "COD") {
      res.json({ codSuccess: true });
    } else if (req.body["payment-method"] == "RazorPay") {
      console.log(orderDoc._id, "iddd of order");
      var options = {
        amount: orderDoc.totalAmount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: orderIdString,
      };
      instance.orders.create(options, function (err, order) {
        console.log(order, "new order");
        res.json(order);
      });
    } else if (req.body["payment-method"] == "PayPal") {
      let amount = Math.floor(orderDoc.totalAmount / 75);
      console.log(amount, "///////");
      amount = new String(amount);
      console.log(amount, "amount 1");
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `http://localhost:3001/paymentsuccess/?objId=${orderId}`,
          cancel_url: `http://localhost:3001/paypal-cancel/?objId=${orderId}`,
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "item",
                  sku: "item",
                  price: amount,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: amount,
            },
            description: "This is the payment description.",
          },
        ],
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          console.log(payment.links[1].href, "link");
          console.log(payment.links, "payment link");
          console.log(payment.links[1], "payment link[1]");
          // Check that payment.links[1] exists
          if (payment.links && payment.links[1]) {
            // Redirect the user to the PayPal checkout page
            res.json({ payment });
          } else {
            console.log("Payment response missing redirect URL");
            res.status(500).send("Unable to process payment");
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.successPagePayPal = async (req, res) => {
  try {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    let objId = req.query.objId;
    console.log(objId, "obj id");
    let orderDoc = await Order.findOne({ _id: objId });
    let amount = Math.floor(orderDoc.totalAmount / 75);
    amount = new String(amount);
    console.log(amount, "amount");
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: amount,
          },
        },
      ],
    };
    await Order.updateOne(
      { _id: objId },
      {
        $set: {
          paymentstatus: "placed",
        },
      }
    );
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        res.redirect("/orderPlaced");
      }
    );
  } catch (error) {
    console.log(error, "eror");
  }
};

exports.cancelPagePayPal = async (req, res) => {
  let objId = req.query.objId;
  await Order.updateOne(
    { _id: objId },
    {
      $set: {
        paymentstatus: "failed",
      },
    }
  );
  res.redirect("/payment-failed");
};

exports.paymentVerify = async (req, res) => {
  console.log(req.body, "..success of order");

  try {
    let details = req.body;
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "NU1nWwREDDpDVKdjog8bUFrj");

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    const razorpayOrderId = req.body.payment.razorpay_order_id;
    const razorpayPaymentId = req.body.payment.razorpay_payment_id;
    const razorpaySignature = req.body.payment.razorpay_signature;
    console.log(req.body.payment.razorpay_order_id);
    console.log(req.body.payment.razorpay_payment_id);
    console.log(req.body.payment.razorpay_signature);

    console.log(req.body.order.receipt);
    let orderResponse = req.body.order.receipt;
    console.log(orderResponse, "????????????");
    let orderObjId = new ObjectId(orderResponse);
    console.log(";;;;;;;;;;;;;;;;;");
    console.log(hmac, "///////////");
    console.log(req.body.payment.razorpay_signature, "🔥🔥🔥");

    if (hmac == details.payment.razorpay_signature) {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("payment is successful");
      res.json({ status: true });
    } else {
      await Order.updateOne(
        { _id: orderObjId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );
      console.log("payment is failed");
      res.json({ status: false, errMsg: "" });
    }
  } catch (error) {
    console.log(error, "error");
  }
};

exports.paymentFailed = async (req, res) => {
  res.render("user/paymentFailed", { other: true });
};

exports.orderPlacedCod = (req, res) => {
  let user = req.session.user;

  try {
    res.render("user/OrderPlacedCod", { video: true, user, cartIcon: true });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.orders = async (req, res) => {
  let orders = await Order.find({ userId: req.session.user._id })
    .sort("-updatedAt")
    .populate({
      path: "products.item",
      model: "Product",
    })
    .exec();

  console.log(orders, "ordersssss");
  // res.locals.orders=orders
  //   const userId = req.session.user._id;
  //   // console.log(userId,"lksdfjglkjdlsafkjglkaj")
  //   let orders = await Order.find({ userId: userId });
  //   // console.log(orders)
  // Access cartCount value from req object
  const cartCount = req.cartCount;
  if (req.session.filterOrders) {
    res.locals.orders = req.session.filterOrders;
    req.session.filterOrders = null;
  } else if (req.session.noOrders) {
    res.locals.orders = req.session.noOrders;
    req.session.noOrders = null;
  } else if (req.session.cancelledOrders) {
    res.locals.orders = req.session.cancelledOrders;
    req.session.cancelledOrders = null;
  } else if (req.session.notShippedOrders) {
    res.locals.orders = req.session.notShippedOrders;
    req.session.notShippedOrders = null;
  } else if (req.session.returneddOrders) {
    res.locals.orders = req.session.returneddOrders;
    req.session.returneddOrders = null;
  } else {
    res.locals.orders = orders;
  }
  res.render("user/OrderView", {
    video: true,
    cartCount,
    user: req.session.user,
  });
};

exports.viewOrderProducts = async (req, res) => {
  let user = req.session.user;
  let order = req.params.id;
  let cond = new ObjectId(order);
  console.log(cond);
  console.log(order, "lkjkljlkjlkjkklllllllll");

  try {
    // Fetch the cart items
    // let cartItems = await Order.aggregate([
    //   {
    //     $match: { _id: cond },
    //   },

    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: 'products.item',
    //       foreignField: "_id",
    //       as:"productInfo",
    //     },
    //   }

    // ]);

    let cartItems = await Order.aggregate([
      {
        $match: { _id: cond },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.item",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          _id: 1,
          deliveryDetails: 1,
          userId: 1,
          paymentMethod: 1,
          products: 1,
          totalAmount: 1,
          paymentstatus: 1,
          deliverystatus: 1,
          createdAt: 1,
          productInfo: {
            $map: {
              input: "$productInfo",
              as: "p",
              in: {
                _id: "$$p._id",
                productname: "$$p.productname",
                images: "$$p.images",
                quantity: {
                  $arrayElemAt: [
                    "$products.quantity",
                    {
                      $indexOfArray: ["$products.item", "$$p._id"],
                    },
                  ],
                },
                size: {
                  $arrayElemAt: [
                    "$products.size",
                    {
                      $indexOfArray: ["$products.item", "$$p._id"],
                    },
                  ],
                },
                currentPrice: {
                  $arrayElemAt: [
                    "$products.currentPrice",
                    {
                      $indexOfArray: ["$products.item", "$$p._id"],
                    },
                  ],
                },
                tax: {
                  $arrayElemAt: [
                    "$products.tax",
                    {
                      $indexOfArray: ["$products.item", "$$p._id"],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$productInfo",
      },
    ]);

    console.log(cartItems, "///////////");
    console.log(cartItems[0].products, "?????????????");
    // console.log(cartItems[0].products,"💥💥💥")
    // console.log(cartItems[0].productInfo,"hgjhgjhgjhgjhgjhghg");
    // Access cartCount value from req object
    const cartCount = req.cartCount;
    // Add the quantity of each product to the corresponding product object
    // cartItems[0].productInfo.forEach((product, index) => {
    //   product.quantity = cartItems[0].products[index].quantity;
    // });

    res.render("user/viewProductDetails", {
      user,
      video: true,
      cartCount,
      cartItems,
      products: cartItems[0].products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

exports.filterPost = async (req, res) => {
  console.log("////////////");

  let category = req.params.category;
  let brand = req.params.brands;
  console.log(category);
  console.log(brand);

  // get the category ID from the request parameters
  var categoryId = req.params.categoryId;
  console.log(categoryId, "🔥🔥🔥");

  try {
    const products = await Product.find({ category: categoryId });
    console.log(products);
    res.json(products); // Return the products as a JSON response
  } catch (error) {
    console.log(error);
  }
};

exports.filterSub = async (req, res) => {
  const sub = req.params.subcategoryId;
  console.log(sub);

  try {
    const products = await Product.find({ subcategory: sub });
    console.log(products);

    // Send the filtered products to the client
    res.json(products);
  } catch (error) {
    console.log(error);
  }
};
