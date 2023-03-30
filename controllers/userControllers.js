// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const User = require("../models/userSchema");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const { response } = require("../app");
const OTP = require("../models/otpSchema");
const Admin = require('../models/adminSchema')

exports.userHome = async (req, res) => {
  try {
    res.render("user/index", { other: true });
  } catch (error) {
    console.log(error);
  }
};

exports.homePage = async (req, res) => {
  try {
    req.session.tempUser = null;
    let user = req.session.user;
    console.log(user);
    const products = await Product.find({});
    // console.log(products)
    res.render("user/men", { products, user });
  } catch (error) {
    console.log(error);
  }
};
exports.userCart = async (req, res) => {
  try {
    console.log("hey cart");
    res.render("user/UserCart");
  } catch (error) {
    console.log(error);
  }
};

exports.loginPage = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/User_Login", {
      other: true,
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
};

exports.postSignup = async (req, res) => {
  try {
    const existingUser  = await User.findOne({email:req.body.email})
    if(existingUser){
      console.log(`User with ${req.body.email} already exist`)
      req.session.loginErr = "Email is already exist"
      res.redirect('/signup')
    }else{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      mobile: req.body.mobile,
      status: false,
      isActive: true,
    });
    User.create(newUser);
    console.log(newUser);
    console.log('jsdkjfhkdjsfhkjhsdfjkhkjsdhfkj')
    res.redirect("/login");
  }} catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};

exports.postLogin = async (req, res) => {
  try {
    console.log("r[rakjfapsdfj");
    const newUser = await User.findOne({ email: req.body.email });
    console.log(newUser);
    if (newUser) {
      console.log("klasjdlfkj");
      bcrypt.compare(req.body.password, newUser.password).then((status) => {
        if (status) {
          console.log("user exist");
          req.session.user = newUser;
          req.session.user.loggedIn = true;
          console.log(newUser);
          res.redirect("/");
        } else {
          req.session.loginErr = "Invalid Email or Password";
          console.log("password is not matching");
          res.status(400).redirect("/login");
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

exports.otpLogin = async (req, res) => {
  try {
    const number = req.body.number;

   

    //generate random 5 digit number between 1-9
    let randomNumber = Math.floor(Math.random() * 908800) + 100000;

    //send random numbers to users number (twilio)
    client.messages
      .create({ body: randomNumber, from: "+14752628418", to: number })
      .then(otpfun());

    //save random Number to database then renders verify page
   async function otpfun(){
      const newUser = new OTP({
        users:req.body.number,
        otp: randomNumber,
      });
      await OTP.create(newUser)
    }
    res.render("user/verify",{other:true});

    // function saveUser() {
    
    //   console.log(newUser)
    //   newUser
    //     .save()
    //     .then(() => {
    //       res.render("user/verify");
    //     })
    //     .catch((err) => {
    //       console.log("error generating number", err);
    //     });
    // }
  } catch (error) {
    console.log(error);
  }
};

exports.verify = async (req, res) => {
  res.render("user/verify", { other: true });
};
exports.postVerify = (req, res) => {
  
  const code = req.body.code;
  console.log("heyyyyyy")
  // OTP.findOne({ users: code }, (err, found) => {
  //   if (err) {
  //     res.render("error");
  //   } else if (found) {
  //     res.render("user/success");
  //   } else {
  //     res.render("user/error");
  //   }

  OTP.findOne({ otp: code })
  .then(found => {
    if (found) {
      res.render("user/success",{other:true});
    } else {
      res.render("user/error",{other:true});
    }
  })
  console.log("jksadhfkjhkjsadfhkjhsadkjf")



  OTP.findOneAndDelete({ otp: code })
  .exec()
  .then((result) => {
    console.log("deleted");
  })
  .catch((err) => {
    console.log(err);
  });
}

  //   OTP.findOneAndDelete({ users: code }, (err) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log("deleted");
  //     }
  //   });
  // }


exports.otpSuccess = (req, res) => {
  res.render("user/success", { other: true });
};
exports.otpError = (req, res) => {
  res.render("user/error", { other: true });
};
