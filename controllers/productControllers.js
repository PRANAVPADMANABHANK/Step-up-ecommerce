const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')
const multer = require('multer')

//storage
const storage = multer.diskStorage({
    destination: function(req, file , cb){
      return cb (null, "./public/uploads")
    },
    filename : function(req, file , cb){
      return cb (null, `${Date.now()}-${file.originalname}`)
    }
  })
  
  const upload = multer({storage})


exports.addProductPage = async(req,res)=>{
  let adminDetails =req.session.admin;
  const categories = await Category.find();
  const subcategories = await SubCategory.find()
  console.log(categories,'categoreezz')
  console.log(subcategories,'subcategories')
  res.render('admin/addProduct',{admin:true,adminDetails,categories,subcategories})
}

exports.postProduct =(req,res,next)=>{
  
    upload.array('image',5)(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(req.body)
      console.log(req.files)
    console.log(req.body.category,'hellloooooooo')
    try{
      const newProduct = new Product({
          company: req.body.company,
          productname: req.body.productname,
          type: req.body.type,
          category: req.body.category,
          subcategory:req.body.subcategory,
          deal: req.body.deal,
          price: req.body.price,
          size: req.body.size,
          images: req.files.map(file => file.filename)
      });
      await Product.create(newProduct);
      console.log(newProduct)
      res.redirect('/admin/admin');
    }catch(error){
      console.log(error);
    }
  
  });
  };

  exports.getAllProducts = async(req,res)=>{
    try{
        const products = await Product.find({});
        let adminDetails =req.session.admin;
        const categories = await Category.find();
        const subcategories = await SubCategory.find()
        res.render('admin/viewProducts',{admin:true,products,adminDetails,categories,subcategories});
      }catch(error){
        console.log(error);
      }
    
}

exports.deleteProduct = async (req, res) => {
  console.log(req.params.id,"///////////")
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.redirect('back')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getEditProductPage = async(req,res)=>{
  try{
       const editProduct = await Product.findOne({_id: req.params.id})
       console.log(editProduct,"editProduct found")
       let adminDetails =req.session.admin;
       const categories = await Category.find();
       const subcategories = await SubCategory.find()
       res.render('admin/editProduct',{editProduct,admin:true,adminDetails,categories, subcategories})
    }catch(error){
       console.log(error);
    }
  
}


exports.editProduct = async(req,res)=>{
   console.log(req.params.id,'paramsss')
  console.log('kjhsadkjfhksdajhfsdaf');
  console.log(req.body,'bodyyyyy')
  
  upload.array('image',5)(req, res, async (err) => {
   try{
    const items = await Product.updateOne({_id:req.params.id},{
          company: req.body.company,
          productname: req.body.productname,
          type: req.body.type,
          category: req.body.category,
          subcategory: req.body.subcategory,
          deal: req.body.deal,
          price: req.body.price,
          size: req.body.size,
          images: req.files.map(file => file.filename) 
    })
    
   console.log(items,'////////////////////');

    console.log(items)
    await res.redirect('/admin/admin');
    console.log('redirected')
   }catch(error){
     console.log(error)
   }

  });
  
}



