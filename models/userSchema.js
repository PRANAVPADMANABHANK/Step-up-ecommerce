const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema =new Schema({
    name :{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true
    },
    password :{
        type: String,
        required: true
    },
    mobile :{
        type: String,
        required: true
    },
    address :[
        
        { 
         name: String,
         mobile: String,
         addressDetails: String,
         city:String,
         state:String,
         zip:Number,
         typeOfAddress:String
         }
     ],
    status :{
        type: Boolean,
        required:true
    },
    isActive :{
        type: Boolean,
        required:true
    },
    appliedCoupon:[
        {applied:String,
        coupondis:Number,
        minPurchase:Number,
        status:Boolean
        }

    ],
},
{
    timestamps:true
});


module.exports = mongoose.model('User', userSchema);