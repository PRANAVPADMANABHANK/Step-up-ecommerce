const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const subCategorySchema = new Schema({
    
    sub_category:{
        type:String,
        required:true
        },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
      }
},
{
    timestamps:true
}
)


module.exports = mongoose.model('SubCategory',subCategorySchema);