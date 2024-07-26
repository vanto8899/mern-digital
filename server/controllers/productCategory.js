const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");

// create category
const createCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdCategory: response ? response : "Cannot create category!",
  });
});

// get category
const getCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find();
  const counts = await ProductCategory.countDocuments();
  return res.status(200).json({
    success: response ? true : false,
    counts,
    productCategory: response ? response : "Cannot get category!",
  });
});

// update category
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot update category!",
  });
});

// delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);
  return res.status(200).json({
    success: response ? true : false,
    deletedCategory: response ? response : "Cannot delete category!",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
