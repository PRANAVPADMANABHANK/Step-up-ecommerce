const Banner = require("../models/bannerSchema");
const multer = require("multer");

//storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

exports.getBanner =async (req, res) => {
  try {
  
    res.render("admin/banner", { admin: true });
  } catch (error) {
    console.log(error);
  }
};

exports.addBanner = async (req, res) => {
  upload.array("image", 5)(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    console.log(req.body);
    console.log(req.files);
    // console.log(req.body.category,'hellloooooooo')
    try {
      const banner = new Banner({
        title: req.body.title,
        description: req.body.description,
        images: req.files.map((file) => file.filename),
      });
      await Banner.create(banner);
      console.log(banner);
      res.redirect('/admin/banner');
    } catch (error) {
      console.log(error);
    }
  });
};
