const Wishlist = require('../models/wishlistSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Product = require('../models/productSchema')

exports.wishListPage = async(req,res)=>{

    try{
       if(req.session.user){
           const wishItems = await Wishlist.findOne({ user_id: req.session.user._id }).populate('products.product_id');
          if (!wishItems) {
            // Handle the case when no wishlist is found
            console.log(wishItems,'newone')
             // Access cartCount value from req object
            const cartCount = req.cartCount;
            return res.render('user/wishList',{video: true, user:req.session.user, cartCount})
          }else {
            
            console.log(wishItems,'wishisi')
            return res.render('user/wishList',{wishItems,video: true, user:req.session.user, cartCount})
          }
          
         } else{
            return res.redirect('/login')
        }
      

    }catch(error){
         console.log(error)
    }
  
}

exports.addToWishList = async(req,res)=>{

    try{

      if(req.session.user){
        let prdId = new ObjectId(req.params.id)
        console.log(prdId,"////////////////////")
        let proItmes = {
            product_id : prdId
        }
        console.log(proItmes,'????????')
        let wishListItem = await Wishlist.findOne({ user_id: req.session.user._id})
        
        console.log(wishListItem,'wish lsit')
        if(wishListItem){
           const productIndex = wishListItem.products.findIndex(product =>String(product.product_id) === String(prdId));
           console.log(productIndex,'value of exist or not')
    
           if(productIndex !== -1){
              return  res.json({status:false})
           }else{
            await Wishlist.updateOne({user_id:req.session.user._id},{$push:{products:proItmes}})
             return res.json({status:true})
           }
      

        }else{
            const newItem = new Wishlist({
                user_id :req.session.user._id,
                products : [proItmes]
            })
            await Wishlist.create(newItem)
           return res.json({status:true})
        }
      }else{
        console.log('hello')
        return res.json(false)
      }
     
    }catch(error){
        console.log(error)
    }

}