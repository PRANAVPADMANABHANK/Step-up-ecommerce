const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
      couponCode :{
        type: String,
        required: true
      },
      discount :{
        type: Number,
        required: true
      },
      minPurchase:{
        type: Number,
        required: true
      },
      expires:{
        type: Date,
        required: true
      },
      statusEnable:{
        type: Boolean,
        required: true
      }
},
{
    timestamps:true
})

module.exports = mongoose.model("Coupon",couponSchema);