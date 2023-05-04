const Product = require('../models/product')
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
  res.render('admin/addProduct',{admin:true,adminDetails})
}

exports.postProduct =(req,res,next)=>{
    upload.array('image',3)(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(req.body)
      console.log(req.files)
    
    try{
      const newProduct = new Product({
          company: req.body.company,
          productname: req.body.productname,
          category: req.body.category,
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
        res.render('admin/viewProducts',{admin:true,products});
      }catch(error){
        console.log(error);
      }
    
}

exports.deleteProduct = async (req,res)=>{
  try{
   await Product.deleteOne({_id: req.params.id});
   res.redirect("/admin/admin");

  }catch(error){
   console.log(error)
  }
}

exports.getEditProductPage = async(req,res)=>{
  try{
       const editProduct = await Product.findOne({_id: req.params.id})
       let adminDetails =req.session.admin;
       res.render('admin/editProduct',{editProduct,admin:true,adminDetails})
    }catch(error){
       console.log(error);
    }
  
}


exports.editProduct = async(req,res)=>{
   console.log(req.params.id,'paramsss')
  console.log('kjhsadkjfhksdajhfsdaf');
  console.log(req.body,'bodyyyyy')
  upload.array('image',4)(req, res, async (err) => {
   try{
    const items = await Product.updateOne({_id:req.params.id},{
          company: req.body.company,
          productname: req.body.productname,
          category: req.body.category,
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

