const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    company:{
        type : String,
        require : true
    },
    productname:{
        type : String,
        required : true
    },
    category:{
        type : String,
        required : true
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
    ]
})

//model name: "Product" will be used to turn into a collection name in DB
//"Product" => 'product' + 's' => products
module.exports = mongoose.model('Product',productSchema)




