// middlewares.js

// Middleware to check for cid parameter
const checkCidParam = (req, res, next) => {
  const { cid } = req.body;
  if (!cid) {
    return res.status(400).json({
      success: false,
      message: "Coupon input missing!",
    });
  }
  next();
};

module.exports = {
  checkCidParam,
};
