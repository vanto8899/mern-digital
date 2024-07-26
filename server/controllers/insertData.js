const Product = require("../models/product");
const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");
const data = require("../../data/data2");
const categoryData = require("../../data/cate.brand");
const slugify = require("slugify");

const fn = async (product) => {
  const colors = [
    "black",
    "white",
    "red",
    "lime",
    "blue",
    "yellow",
    "cyan",
    "magenta",
    "silver",
    "gray",
    "maroon",
    "olive",
    "green",
    "purple",
    "teal",
    "navy",
  ];

  // Function to get a random color from the colors array
  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  const color =
    product?.variants?.find((el) => el.label === "Color")?.variants[0] ||
    "Unknown";

  // Check if color is "Unknown", if so, get a random color
  const finalColor = color === "Unknown" ? getRandomColor() : color;

  await Product.create({
    title: product?.name,
    slug: slugify(product?.name) + Math.round(Math.random() * 100) + "",
    description: product?.description,
    brand: product?.brand,
    price: Math.round(Number(product?.price?.match(/\d+/g).join("")) / 100),
    category: product?.category[1],
    quantity: Math.round(Math.random() * 150), // random quantity
    sold: Math.round(Math.random() * 100), // random sold
    images: product?.images,
    color: finalColor,
    thumb: product?.thumb,
    totalRatings: 0, // random totalRatings: Math.round(Math.random() * 5)
  });
};

// Insert product data
const insertProduct = asyncHandler(async (req, res) => {
  const promises = [];
  for (let product of data) {
    promises.push(fn(product));
  }
  await Promise.all(promises);
  return res.status(200).json("Insert product successfully!");
});

// Insert productCategory data
const fn2 = async (cate) => {
  await ProductCategory.create({
    title: cate?.cate,
    brand: cate?.brand,
    image: cate?.image,
  });
};
const insertCategory = asyncHandler(async (req, res) => {
  const promises = [];
  console.log(categoryData);
  for (let cate of categoryData) {
    promises.push(fn2(cate));
  }
  await Promise.all(promises);
  return res.status(200).json("Insert category successfully!");
});

module.exports = {
  insertProduct,
  insertCategory,
};
