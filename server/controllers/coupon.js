const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// create coupon
const createNewCoupon = asyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body;
  if (!name || !discount || !expiry) throw new Error("Missing Inputs!");
  const response = await Coupon.create({
    ...req.body,
    expiry: Date.now() + expiry * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Coupon created!" : "Cannot create Coupon!",
  });
});

// get coupon
const getCoupons = asyncHandler(async (req, res) => {
  const { q } = req.query; // Extract the query parameter
  let response;
  if (q) {
    let query = {};
    // Check if q is a valid ObjectId
    if (mongoose.isValidObjectId(q)) {
      query = { _id: q };
    } else {
      // Perform case-insensitive regex search on name
      query = { name: { $regex: q, $options: "i" } };
    }
    response = await Coupon.find(query).select("-createdAt -updatedAt");
  } else {
    // Fetch all coupons if no query parameter provided
    response = await Coupon.find().select("-createdAt -updatedAt");
  }
  return res.status(200).json({
    success: true,
    coupons: response,
  });
});

// get coupon by Id
const getCouponById = asyncHandler(async (req, res) => {
  const { cid } = req.body; // Extract the id parameter from the request

  // Check if cid is provided
  if (!cid || !mongoose.isValidObjectId(cid)) {
    return res.status(400).json({
      success: false,
      message: "Invalid coupon ID!",
    });
  }
  // Proceed only if cid is valid
  let coupon = await Coupon.findById(cid).select("-createdAt -updatedAt");
  // If coupon is not found, return 404
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found!",
    });
  }

  // If coupon is found, return 200 with coupon data
  return res.status(200).json({
    success: true,
    coupon,
  });
});

// update coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing Inputs!");
  // Check if req.body.expiry exists and convert it to a valid date
  if (req.body.expiry) {
    req.body.expiry = new Date(
      Date.now() + parseInt(req.body.expiry) * 24 * 60 * 60 * 1000
    );
  }
  const response = await Coupon.findByIdAndUpdate(cid, req.body, { new: true });
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Coupon updated!" : "Cannot update coupon!",
  });
});

// delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await Coupon.findByIdAndDelete(cid, req.body, { new: true });
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Coupon deleted!" : "Cannot delete coupon!",
  });
});

module.exports = {
  createNewCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getCouponById,
};
