const Product = require("../models/product.js");
const User = require("../models/user.js");
const Order = require("../models/order.js");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const makeSKU = require("uniqid");

// Create product
const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req.files?.images?.map((el) => el.path);
  if (!(title && price && description && brand && category && color))
    throw new Error("Missing Inputs!");
  req.body.slug = slugify(title);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    message: newProduct ? "Product created!" : "Product create failed!",
  });
});

// get product by id
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postedBy",
      select: "firstname lastname avatar",
    },
  });
  if (!product) throw new Error("Product not found!");
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product!",
  });
});

// Get product in order by product id
const getProductInOrder = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  // Find orders containing the product with the specified pid
  const orders = await Order.find({ "products.product": pid });
  // Check if the product is found in any order
  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Product not found in any order!",
    });
  }
  // Extract order details where the product is found
  const orderDetails = orders.map((order) => {
    const productInOrder = order.products.find(
      (p) => p.product.toString() === pid
    );
    return {
      orderId: order._id,
      orderCode: order.orderCode,
      quantity: productInOrder.quantity,
    };
  });
  // Return the order details
  return res.status(200).json({
    success: true,
    orderDetails,
  });
});

// get all products
const getAllProductNoLimit = asyncHandler(async (req, res) => {
  const products = await Product.find();
  const counts = await Product.countDocuments();
  res.status(200).json({
    success: true,
    counts,
    products,
  });
});

// get all products (filtering, sorting, pagination)
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    let queries = { ...req.query };
    // console.log("Initial req.query:", req.query);

    // Fields to exclude
    const excludeFields = ["limit", "sort", "page", "fields", "q"];
    excludeFields.forEach((el) => delete queries[el]);
    //console.log("Queries after excluding fields:", queries);

    // Format query
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (matchEl) => `$${matchEl}`
    );
    let formattedQueries = JSON.parse(queryString);
    let colorQueryObject = {};
    // Log the formatted queries
    //console.log("Formatted Queries:", formattedQueries);

    // Filtering by title
    if (queries?.title) {
      formattedQueries.title = { $regex: queries.title, $options: "i" };
      //console.log("Filtered by Title:", formattedQueries.title);
    }

    // Filtering by category
    if (queries?.category) {
      formattedQueries.category = { $regex: queries.category, $options: "i" };
      //console.log("Filtered by Category:", formattedQueries.category);
    }
    // Filtering by category
    if (queries?.brand) {
      formattedQueries.brand = { $regex: queries.brand, $options: "i" };
    }

    // Filtering by color
    if (queries?.color) {
      delete formattedQueries.color;
      const colorArr = queries.color?.split(",");
      const colorQuery = colorArr.map((el) => ({
        color: { $regex: el, $options: "i" },
      }));
      colorQueryObject = { $or: colorQuery };
      //console.log("Color Query Object:", colorQueryObject);
    }
    // Filtering by ratings (totalRatings as an array)
    if (queries?.totalRatings) {
      const ratingArr = queries.totalRatings.split(",").map(Number); // Split and convert to array of numbers
      formattedQueries.totalRatings = { $in: ratingArr }; // Use $in to match any of the values in the array
      //console.log(formattedQueries.totalRatings);
    }

    // Searching by 'q' (title, category, color, brand, or description)
    let queryObject = {};
    if (req.query.q) {
      queryObject = {
        $or: [
          { color: { $regex: req.query.q, $options: "i" } },
          { title: { $regex: req.query.q, $options: "i" } },
          { category: { $regex: req.query.q, $options: "i" } },
          { brand: { $regex: req.query.q, $options: "i" } },
          { description: { $regex: req.query.q, $options: "i" } },
        ],
      };
      //console.log("Search Query Object:", queryObject);
    }
    // Build the query command
    const qr = {
      ...colorQueryObject,
      ...formattedQueries,
      ...queryObject,
    };
    //console.log("Final Query Object:", qr);
    let queryCommand = Product.find(qr);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit =
      parseInt(req.query.limit, 10) ||
      parseInt(process.env.PAGE_LIMIT_PRODUCTS, 10);
    const skip = (page - 1) * limit;

    queryCommand = queryCommand.skip(skip).limit(limit);

    // Execute the query
    const products = await queryCommand.exec();
    const counts = await Product.countDocuments(qr);

    return res.status(200).json({
      success: true,
      counts,
      products,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// update product
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;
  if (files?.thumb) req.body.thumb = files?.thumb[0]?.path;
  if (files?.images) req.body.images = files?.images?.map((el) => el.path);
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    message: updatedProduct ? "Product updated!" : "Cannot update product!",
  });
});

// delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  // Check if any user has the product in their cart or wishlist
  const usersWithProductInCart = await User.find({ "cart.product": pid });
  const usersWithProductInWishlist = await User.find({ wishlist: pid });
  if (
    usersWithProductInCart.length > 0 ||
    usersWithProductInWishlist.length > 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete product! Product is in user carts or wishlists.",
    });
  }
  // Proceed to delete the product
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    message: deletedProduct ? "deleted Product!" : "Cannot delete product!",
  });
});

// Rating product
const ratingProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid, updatedAt } = req.body;
  if (!star || !pid) throw new Error("Star and product ID are required!");
  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings.find(
    (el) => el.postedBy.toString() === _id
  );
  if (alreadyRating) {
    // update star & comment
    await Product.updateOne(
      { ratings: { $elemMatch: { postedBy: _id } } },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      { new: true }
    );
  } else {
    //add star & comment
    const response = await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }

  // Sum of ratings
  const updatedProduct = await Product.findById(pid);
  const ratingCounts = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + el.star,
    0
  );

  updatedProduct.totalRatings =
    ratingCounts > 0 ? Math.round((sumRatings * 10) / ratingCounts) / 10 : 0;
  await updatedProduct.save();

  return res.status(200).json({
    status: true,
    updatedProduct,
    message: "Updated rating success!",
  });
});

// upload imgae of product
const uploadImagesProduct = asyncHandler(async (req, res) => {
  // console.log(req.files);
  const { pid } = req.params;
  if (!req.files) throw new Error("Missing images Inputs!");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    updatedProduct: response ? response : "Cannot upload product images!",
  });
});

// Add varriants
const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req.files?.images?.map((el) => el.path);
  if (!(title && price && color)) throw new Error("Missing Inputs!");
  if (!req.files) throw new Error("Missing images Inputs!");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: {
        varriants: {
          color,
          price,
          title,
          thumb,
          images,
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  );
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Added varriant!" : "Cannot add varriants!",
  });
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  ratingProduct,
  uploadImagesProduct,
  addVarriant,
  getAllProductNoLimit,
  getProductInOrder,
};
