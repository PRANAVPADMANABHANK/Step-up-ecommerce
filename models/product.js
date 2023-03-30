const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name:{
        type : String,
        require : true
    },
    category:{
        type : Array,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    price:{
        type : Number,
        required : true
    },
    images:[
        { type : String }
    ]
})

//model name: "Product" will be used to turn into a collection name in DB
//"Product" => 'product' + 's' => products
module.exports = mongoose.model('Product',productSchema)




