const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Blog = require("../models/blog");

// create blog
const createNewBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category)
    throw new Error("Please provide all required fields!");
  const response = await Blog.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdBlog: response ? response : "Cannot create new Blog!",
  });
});

// update blog
const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  if (Object.keys(req.body).length === 0)
    throw new Error("Please provide all required fields!");
  const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true });
  return res.status(200).json({
    success: response ? true : false,
    createdBlog: response ? response : "Cannot update Blog!",
  });
});

// get blog
const getBlogs = asyncHandler(async (req, res) => {
  const response = await Blog.find();
  return res.status(200).json({
    success: response ? true : false,
    createdBlog: response ? response : "Cannot get Blog!",
  });
});
//like, dislike
/*
 khi nguoi dung like mot bai blog:
 1. check xem nguoi do da like hay chua => bo like/ them like
 2. check xem nguoi do da dislike hay chua => bo dislike
 */

// Like blog
const likeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;

  if (!bid) {
    return res.status(400).json({ success: false, message: "Missing Inputs!" });
  }

  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(bid) ||
    !mongoose.Types.ObjectId.isValid(_id)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format!" });
  }

  const blog = await Blog.findById(bid);

  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found!" });
  }

  // If the user has disliked the blog, remove the dislike
  const alreadyDisliked = blog.dislike.find((el) => el.toString() === _id);
  if (alreadyDisliked) {
    await Blog.findByIdAndUpdate(
      bid,
      {
        $pull: { dislike: new mongoose.Types.ObjectId(_id) },
        isDislike: false,
      },
      { new: true }
    );
  }

  const isLiked = blog.like.find((el) => el.toString() === _id);
  let response;

  if (isLiked) {
    // If the blog is already liked, unlike it
    response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { like: new mongoose.Types.ObjectId(_id) }, isLiked: false },
      { new: true }
    );
  } else {
    // If the blog is not liked, like it
    response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { like: new mongoose.Types.ObjectId(_id) }, isLiked: true },
      { new: true }
    );
  }

  return res.status(200).json({
    success: response ? true : false,
    blog: response,
    message: isLiked
      ? "Blog unliked successfully!"
      : "Blog liked successfully!",
  });
});

// Dislike blog
const dislikeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;

  if (!bid) {
    return res.status(400).json({ success: false, message: "Missing Inputs!" });
  }

  // Validate ObjectId
  if (
    !mongoose.Types.ObjectId.isValid(bid) ||
    !mongoose.Types.ObjectId.isValid(_id)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format!" });
  }

  const blog = await Blog.findById(bid);

  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found!" });
  }

  // If the user has liked the blog, remove the like
  const alreadyLiked = blog.like.find((el) => el.toString() === _id);
  if (alreadyLiked) {
    await Blog.findByIdAndUpdate(
      bid,
      {
        $pull: { like: new mongoose.Types.ObjectId(_id) },
        isLiked: false,
      },
      { new: true }
    );
  }

  const isDisliked = blog.dislike.find((el) => el.toString() === _id);
  let response;

  if (isDisliked) {
    // If the blog is already disliked, remove the dislike
    response = await Blog.findByIdAndUpdate(
      bid,
      {
        $pull: { dislike: new mongoose.Types.ObjectId(_id) },
        isDislike: false,
      },
      { new: true }
    );
  } else {
    // If the blog is not disliked, dislike it
    response = await Blog.findByIdAndUpdate(
      bid,
      {
        $push: { dislike: new mongoose.Types.ObjectId(_id) },
        isDislike: true,
      },
      { new: true }
    );
  }

  return res.status(200).json({
    success: response ? true : false,
    blog: response,
    message: isDisliked
      ? "Blog undisliked successfully!"
      : "Blog disliked successfully!",
  });
});

// get blog by id
const excludedFields = "-refreshToken -password -role -createAt -updatedAt";
const getBlogById = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndUpdate(
    bid,
    { $inc: { numberView: 1 } },
    { new: true }
  )
    .populate("like", "firstname lastname email")
    .populate("dislike", "firstname lastname email");
  return res.status(200).json({
    success: blog ? true : false,
    rs: blog,
  });
});

// delete blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndDelete(bid);
  return res.status(200).json({
    success: blog ? true : false,
    deletedBlog: blog || "Something went wrong!",
  });
});

// upload imgae of blog
const uploadImagesBlog = asyncHandler(async (req, res) => {
  // console.log(req.files);
  const { bid } = req.params;
  if (!req.file) throw new Error("Missing images Inputs!");
  const response = await Blog.findByIdAndUpdate(
    bid,
    { image: req.file.path },
    { new: true }
  );
  return res.status(200).json({
    status: response ? true : false,
    updatedProduct: response ? response : "Cannot upload blog images!",
  });
});

module.exports = {
  createNewBlog,
  updateBlog,
  getBlogs,
  likeBlog,
  dislikeBlog,
  getBlogById,
  deleteBlog,
  uploadImagesBlog,
};
