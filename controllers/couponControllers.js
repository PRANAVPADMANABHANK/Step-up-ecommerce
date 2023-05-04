const Coupon = require("../models/couponSchema");
const User = require("../models/userSchema");
var voucher_codes = require("voucher-code-generator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.couponPage = async (req, res) => {
  console.log("hhhhhhhhhhhhhhhhhhhhhhh");
  let adminDetails = req.session.admin;
  let coupon = await Coupon.find();
  console.log(adminDetails);
  console.log(coupon);

  res.locals.coupon = coupon;
  res.render("admin/coupon", { admin: true, adminDetails });
};

exports.postCoupon = async (req, res) => {
  console.log(req.body, "...body");
  const voucher = voucher_codes.generate({
    prefix: "CODE-",
    length: 7,
    charset: voucher_codes.charset("alphabetic"),
    postfix: "-OFF",
  });
  let strCoupon = voucher.toString();
  console.log(strCoupon);
  const newCoupon = new Coupon({
    couponCode: strCoupon,
    discount: req.body.discount,
    minPurchase: req.body.minPurchase,
    expires: req.body.expires,
    statusEnable: true,
  });
  await Coupon.create(newCoupon);

  res.redirect("/admin/coupon");
};

exports.disableCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndUpdate(
      { _id: req.params.id },
      {
        statusEnable: false,
      }
    );

    await res.json(true);
  } catch (error) {
    console.log(error);
  }
};

exports.enableCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndUpdate(
      { _id: req.params.id },
      {
        statusEnable: true,
      }
    );

    await res.json(true);
  } catch (error) {
    console.log(error);
  }
};

exports.editCoupon = async (req, res) => {
  try {
    let couponId = req.query.couponId;
    let couponDetails = await Coupon.findOne({ _id: couponId });
    res.json(couponDetails);
  } catch (error) {
    console.log(error);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    let { couponId, couponCode, couponDiscount, couponMinPurchase, couponExp } =
      req.body;
    let updatedCoupn = await Coupon.findByIdAndUpdate(
      { _id: couponId },
      {
        couponCode: couponCode,
        discount: couponDiscount,
        minPurchase: couponMinPurchase,
        expires: couponExp,
      },
      { new: true }
    );
    console.log(updatedCoupn, "updatedcoupon");
    await res.json(updatedCoupn);
  } catch (error) {
    console.log(error);
  }
};

exports.applyCoupon = async (req, res) => {
  console.log(req.body, "...coupon id ");
  cartTotal = parseInt(req.body.total.replace(/\D/g, ""));

  let matchCouponId = await Coupon.findOne({
    couponCode: req.body.couponId,
    statusEnable: true, // check if the coupon is enabled
    expires: { $gt: Date.now() }, // check if the current date is before the expiry date
  });
  console.log(cartTotal, "totalparseInt");
  console.log(matchCouponId, "original");
  if (!matchCouponId) {
    return await res.json({ message: "Invalid coupon code" ,success: false});
  } else if (cartTotal < matchCouponId.minPurchase) {
    return await res.json({
      message: `Coupon requires minimum purchase of Rs . ${matchCouponId.minPurchase}`,success: false
    });
  } else {
    let discountPercentage = (matchCouponId.discount / cartTotal) * 100;
    let discountAmount = matchCouponId.discount;
    console.log(discountPercentage);
    console.log(discountAmount);
    res.json({
      message: `Coupon applied! You received a discount of Rs. ${discountAmount} (${discountPercentage}% of the total ${cartTotal})`,
      success: true,
      discountAmount,
      discountPercentage,
      cartTotal,
    });
  }

  // let proExist = await User.findOne({_id:req.session.user._id})
  //  let proExist = await User.aggregate([
  //      {
  //        $match: {
  //          _id: new ObjectId(req.session.userId),
  //          appliedCoupon: {
  //            $elemMatch: {
  //              applied: req.body.couponId,
  //              status:true

  //            }
  //          }
  //        }
  //      }
  //    ]);

  //    console.log(proExist,'proeixsit')
  //    if(proExist.length){
  //      return await res.json({ message: 'coupon is already applied' })
  //    }

  //   console.log(req.session.coupounStatus)
  //  if (!req.session.couponStatus){
  //      let user = await User.findOneAndUpdate(
  //          { _id: req.session.user._id },
  //          {$push: {
  //              appliedCoupon: { applied: req.body.couponId,minPurchase: matchCouponId.minPurchase, coupondis: matchCouponId.discount,status:false }

  //           }},
  //          { new: true })
  //           req.session.couponStatus = true;
  //           const discountedTotal = cartTotal - matchCouponId.discount;
  //           console.log(user,'resssssssss')
  //           console.log(matchCouponId,'idd')
  //           req.session.coupon = matchCouponId;

  //           return await res.json(discountedTotal);

  //   }else{
  //     return await res.json({ message: 'already applied' })
  //  }
};
