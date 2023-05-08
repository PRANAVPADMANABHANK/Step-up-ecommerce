const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    state: { type: String, required: true },
    streetaddress: { type: String, required: true },
    appartment: { type: String, required: true },
    town: { type: String, required: true },
    zip: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    radio: { type: String, required: true },
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentMethod: { type: String, required: true },
  products: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      size: {
        type: String,
        required: true,
      },
      currentPrice: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        required: true,
      },
      orderstatus: {
        type: String,
      },
      deliverystatus: {
        type: String,
      },
    },
  ],
  //   tax: { type: Number, required: true },
  //   couponDiscount: { type: Number },
  totalAmount: { type: Number, required: true },
  paymentstatus: { type: String, required: true },
  deliverystatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
