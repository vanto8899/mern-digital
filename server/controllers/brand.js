const Brand = require("../models/brand");
const asyncHandler = require("express-async-handler");

// create brand
const createBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdBrand: response ? response : "Cannot create Brand!",
  });
});
// get brands
const getBrands = asyncHandler(async (req, res) => {
  const response = await Brand.find();
  return res.status(200).json({
    success: response ? true : false,
    brands: response ? response : "Cannot get Brand!",
  });
});

// update brand
const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndUpdate(bid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedBrand: response ? response : "Cannot update Brand!",
  });
});
// delete brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndDelete(bid);
  return res.status(200).json({
    success: response ? true : false,
    deletedBrand: response ? response : "Cannot delete Brand!",
  });
});

module.exports = {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
};
