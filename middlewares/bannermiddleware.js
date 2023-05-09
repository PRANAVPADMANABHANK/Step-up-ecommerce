const Banner = require("../models/bannerSchema");


async function getBanners(req, res, next) {
    try {
      const banners = await Banner.find();
      res.locals.banners = banners;
      next();
    } catch (err) {
      next(err);
    }
  }

  module.exports = getBanners;