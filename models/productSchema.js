const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    company:{
        type : String,
        required : true
    },
    productname:{
        type : String,
        required : true
    },
    type:{
        type : String,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
      },
    deal:{
        type : String,
        required : true
    },
    price:{
        type : Number,
        required : true
    },
    size:{
        type : String,
        reuired : true
    },
    images:[
        { type : String }
    ],
    deleted: {
        type: Boolean,
        default: false
    }
})

//model name: "Product" will be used to turn into a collection name in DB
//"Product" => 'product' + 's' => products
module.exports = mongoose.model('Product',productSchema)




