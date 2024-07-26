const BlogCategory = require("../models/blogCategory");
const asyncHandler = require("express-async-handler");

// create blog category
const createBlogCategory = asyncHandler(async (req, res) => {
  const response = await BlogCategory.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdBlogCategory: response ? response : "Cannot create BlogCategory!",
  });
});
// get blog category
const getBlogCategories = asyncHandler(async (req, res) => {
  const response = await BlogCategory.find().select("title _id");
  return res.status(200).json({
    success: response ? true : false,
    BlogCategory: response ? response : "Cannot get BlogCategory!",
  });
});

// update blog category
const updateBlogCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedBlogCategory: response ? response : "Cannot update BlogCategory!",
  });
});
// delete blog category
const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params;
  const response = await BlogCategory.findByIdAndDelete(bcid);
  return res.status(200).json({
    success: response ? true : false,
    deletedBlogCategory: response ? response : "Cannot delete BlogCategory!",
  });
});

module.exports = {
  createBlogCategory,
  getBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
};
