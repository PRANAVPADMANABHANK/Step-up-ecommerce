const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')



exports.CreateSubcategory = async(req, res)=>{

    try {
        const categories = await Category.find();
        const subcategories = await SubCategory.find()
        console.log(subcategories)
        res.render('admin/addSubcategory',{admin:true,categories,subcategories})
    } catch (error) {
        console.log(error)
    }
}


exports.createSubcategoryPost = async(req, res)=>{
    console.log(req.body.category)

    try {
        const check_sub = await SubCategory.find({ category_id:req.body.category})
        if(check_sub.length>0){

            let checking = false
            for(let i=0;i<check_sub.length;i++){
                if(check_sub[i]['sub_category'].toLowerCase()===req.body.subcategory.toLowerCase()){
                    checking = true
                    break  
                }
            }
            if(checking===false){
                const subCategory = new SubCategory({
                    sub_category:req.body.subcategory,
                    category_id:req.body.category
                    
                })
                const sub_cat_data = await subCategory.save()
                res.redirect('addsubCategory')
                // res.status(200).send({success:true, msg:"Sub-Category details", data:sub_cat_data})

            }else{
                res.redirect('addsubCategory')
                // res.status(200).send({success:true, msg:"This Sub-Category("+req.body.subcategory+") is already exist"})

            }
        }else{
            const subCategory = new SubCategory({
                sub_category:req.body.subcategory,
                category_id:req.body.category
                
            })
            const sub_cat_data = await subCategory.save()
            console.log(sub_cat_data)
            // res.status(200).send({success:true, msg:"Sub-Category details", data:sub_cat_data})

        }
       
       
        
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}



