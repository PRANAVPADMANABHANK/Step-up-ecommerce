// adminMiddleware.js

exports.verifyAdminLogin = (req, res, next) => {
    if (req.session.admin) {
      next(); // User is logged in as an admin, proceed to the next middleware or route handler
    } else {
      res.redirect('/admin/adminLogin'); // User is not logged in as an admin, redirect to admin login page
    }
  };
  