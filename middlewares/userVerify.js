const wishlist = require('../models/wishlistSchema')
const User = require('../models/userSchema')

exports.wishListCount = async(req,res,next)=>{
    if (req.session.user) {
       
        console.log()
        let wishListCount = 0
        const wishItem = await wishlist.findOne({user_id:req.session.user._id})
        const user = await User.findOne({_id:req.session.user._id})
        res.locals.user = user
        if(wishItem){
            wishListCount = wishItem.products.length;
            req.session.user.wishListCount = wishListCount;
            res.locals.wishListCount=req.session.user.wishListCount;
        }
       
        next();
    } else{
        next();
    }
}