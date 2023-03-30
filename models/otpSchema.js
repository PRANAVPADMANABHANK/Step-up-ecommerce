const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userOtpSchema = new Schema({
    users : String,
    otp : Number
})


module.exports = mongoose.model("OTP", userOtpSchema)