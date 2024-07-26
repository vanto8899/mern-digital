const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const jwt = require("jsonwebtoken");
const sendMail = require("../ultils/sendMail");
const crypto = require("crypto");
const makeRegisToken = require("uniqid");
const { users } = require("../ultils/constant");
const bcrypt = require("bcrypt");

// New user register
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstname,
    lastname,
    mobile,
    role,
    address,
    ward,
    district,
    city,
  } = req.body;

  // Check for missing fields
  if (!email || !password || !firstname || !lastname || !mobile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists!",
    });
  }

  // Generate registration token
  const token = makeRegisToken();
  const emailEdited = btoa(email) + "@" + token;
  const newUser = await User.create({
    email: emailEdited,
    password,
    firstname,
    lastname,
    mobile,
    role,
    address,
    city,
    district,
    ward,
  });

  // Create email content
  if (newUser) {
    const html = `<h2>Register Code: </h2><br /><blockquote>${token}</blockquote>`;

    // Send email
    await sendMail({ email, html, subject: "Account activation" });

    // Set timeout to delete user after 5 minutes
    setTimeout(async () => {
      try {
        await User.deleteOne({ email: emailEdited });
        console.log(
          `User with email ${emailEdited} has been deleted due to timeout.`
        );
      } catch (error) {
        console.error(
          `Failed to delete user with email ${emailEdited}:`,
          error
        );
      }
    }, 300000); // Expire after 5 minutes (300000 ms)
  }

  return res.json({
    success: newUser ? true : false,
    message: newUser
      ? "Please check your email to get the activation code!"
      : "Something went wrong, please try again!",
  });
});

const completeRegister = asyncHandler(async (req, res) => {
  // const cookie = req.cookies;
  const { token } = req.params;
  const notActiveEmail = await User.findOne({ email: new RegExp(`${token}$`) });
  if (notActiveEmail) {
    notActiveEmail.email = atob(notActiveEmail?.email?.split("@")[0]);
    notActiveEmail.save();
  }
  return res.json({
    success: notActiveEmail ? true : false,
    message: notActiveEmail
      ? "Account is activated. Please login!"
      : "Activation code expired. Please try again!",
  });
});

// use login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials!",
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: "User is blocked. Please contact support!",
    });
  }

  // Check if password is correct
  if (await user.isCorrectPassword(password)) {
    // Exclude password and role from the user data
    const { password, role, ...userData } = user.toObject();

    // Generate new tokens
    const accessToken = generateAccessToken(user._id, role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in the database
    await User.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      { new: true }
    );

    // Set new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      sameSite: "lax", // or 'none' if working with cross-site
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      accessToken,
      userData,
      refreshToken: newRefreshToken, // Send the new refresh token in the response
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials!",
    });
  }
});

// get user profile
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOne({ _id })
    .select("-refreshToken -password")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumb price",
      },
    })
    .populate("wishlist", "title thumb price color");
  return res.status(200).json({
    success: user ? true : false,
    res: user ? user : "User not found",
  });
});

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const queries = { ...req.query };

    // fields to exclude
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);

    // format query
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (matchEl) => `$${matchEl}`
    );
    let formattedQueries = JSON.parse(queryString);

    // Filtering
    if (queries?.name) {
      formattedQueries.name = { $regex: queries.name, $options: "i" };
    }
    if (req.query.q) {
      delete formattedQueries.q;
      formattedQueries[`$or`] = [
        { firstname: { $regex: req.query.q, $options: "i" } },
        { lastname: { $regex: req.query.q, $options: "i" } },
        { email: { $regex: req.query.q, $options: "i" } },
      ];
    }
    // console.log(formattedQueries);
    // Build the query command

    let queryCommand = User.find(formattedQueries);

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
      parseInt(req.query.limit, 10) || process.env.PAGE_LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;

    queryCommand = queryCommand.skip(skip).limit(limit);

    // Execute the query
    const users = await queryCommand.exec();
    const counts = await User.countDocuments(formattedQueries);

    return res.status(200).json({
      success: true,
      counts,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete users by id
const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  // Retrieve the user by ID
  const user = await User.findById(uid);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  // Check if the user has items in the cart or wishlist
  if (user.cart && user.cart.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete user with items in their cart!",
    });
  }

  if (user.wishlist && user.wishlist.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete user with items in their wishlist!",
    });
  }

  // Proceed with user deletion if no items are found in cart or wishlist
  const response = await User.findByIdAndDelete(uid);
  return res.status(200).json({
    success: response ? true : false,
    message: response
      ? `User with email ${response.email} deleted!`
      : "No user deleted",
  });
});

// get users by id
const getUserById = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const user = await User.findOne({ _id: uid })
    .select("-refreshToken -password")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumbnail price",
      },
    })
    .populate("wishlist", "title thumb price color");

  if (user) {
    return res.status(200).json({
      success: true,
      res: user,
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// get users by email or mobile
const getUserByEmailOrMobile = asyncHandler(async (req, res) => {
  const { emailOrMobile } = req.params;

  // Determine if the input is an email or a phone number
  const isPhoneNumber = /^[0-9]+$/.test(emailOrMobile);
  const query = isPhoneNumber
    ? { mobile: emailOrMobile }
    : { email: emailOrMobile };
  const user = await User.findOne(query).select("-refreshToken -password");

  if (user) {
    return res.status(200).json({
      success: true,
      res: user,
    });
  } else {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

// Update users
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user; // update cho chinh no lay tu user login
  const {
    firstname,
    lastname,
    email,
    mobile,
    address,
    city,
    district,
    ward,
    message,
  } = req.body;

  const data = {
    firstname,
    lastname,
    email,
    mobile,
    address,
    city,
    district,
    ward,
    message,
  };
  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing Inputs!");
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "User information updated!" : "Something went wrong!",
  });
});

// Update coupon to users
const updateCouponToUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { couponId } = req.body;
  if (!couponId) throw new Error("Missing Inputs!");

  const response = await User.findByIdAndUpdate(
    uid,
    { $set: { coupon: couponId } },
    { new: true }
  ).select("-password -role -refreshToken");

  return res.status(200).json({
    success: response ? true : false,
    message: response ? "Coupon updated!" : "Something went wrong!",
  });
});

// Update users by Admin ()
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (Object.keys(req.body).length === 0) throw new Error("Missing Inputs!");
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    message: response ? "User updated successfull!" : "Something went wrong!",
  });
});

// refresh expired access token
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Missing refreshToken in cookies!" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "RefreshToken is invalid or expired!",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({
      success: true,
      newAccessToken: accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired, please login again.",
      });
    }
    next(error);
  }
});

// logout user
const logout = asyncHandler(async (req, res) => {
  // Lấy refresh token từ cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new Error("No refreshToken in cookies!");
  }
  // Xóa refresh token trong cơ sở dữ liệu
  await User.findOneAndUpdate(
    { refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  // xoa refresh token o trinh duyet
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.status(200).json({
    success: true,
    message: "Logout successfully!",
  });
});

// Reset password: client send email
// server check email co hop le khong ? => send mail + kem theo link (password change token)
// client check mail => click link
// client send api kem token
// check token match token ma server send mail ?
// change password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Kiểm tra xem email đã được cung cấp hay không
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required!" });
  }

  // Tìm người dùng trong cơ sở dữ liệu
  const user = await User.findOne({ email });

  // Kiểm tra xem người dùng có tồn tại không
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found!" });
  }

  // Tạo token và lưu vào cơ sở dữ liệu
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  // Tạo URL để reset password
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Tạo nội dung email
  const html = `Please click the link below to reset your password. This link will expire in 10 minutes.
  <br><br><a href="${resetUrl}">Click Here! Reset Password</a>`;

  // Dữ liệu gửi mail
  const data = {
    email,
    html,
    subject: "Forgot password",
  };

  // Gửi email bất đồng bộ
  sendMail(data)
    .then((rs) => {
      return res.status(200).json({
        success: true,
        message: "Please check your email to reset password",
        rs,
      });
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email", error: err });
    });
});

// Reset password: client send new password
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) throw new Error("Missing Inputs!");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid reset token!");

  const isSamePassword = await bcrypt.compare(password, user.password);
  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from the old password!",
    });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully!",
  });
});

// update address user
const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!req.body.address) throw new Error("Missing Inputs!");
  const response = await User.findByIdAndUpdate(
    _id,
    { $push: { address: req.body.address } },
    { new: true }
  ).select("-password -role -refreshToken");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Something went wrong!",
  });
});

// user add product to cart
const updateUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, quantity = 1, color, price, thumbnail, title } = req.body;

  // Check for missing inputs
  if (!pid || !color) {
    return res.status(400).json({
      success: false,
      message: "Missing input product ID or Color!",
    });
  }

  // Find the user by ID and select the cart field
  const user = await User.findById(_id).select("cart");

  // Check if the user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }

  // Check if the product already exists in the cart with the same color
  const existingProductIndex = user.cart.findIndex(
    (el) => el.product.toString() === pid && el.color === color
  );

  if (existingProductIndex > -1) {
    // Product exists in cart with the same color
    if (
      user.cart[existingProductIndex].quantity === quantity &&
      user.cart[existingProductIndex].price === price
    ) {
      return res.status(200).json({
        success: false,
        message: "This product added in your cart!",
        cart: user.cart,
      });
    }

    // Update quantity and price if different
    user.cart[existingProductIndex].quantity = quantity;
    user.cart[existingProductIndex].price = price;
    user.cart[existingProductIndex].thumbnail = thumbnail;
    user.cart[existingProductIndex].title = title;
  } else {
    // Product does not exist or exists with a different color, add new item
    user.cart.push({
      product: pid,
      quantity,
      color,
      price,
      thumbnail,
      title,
    });
  }

  // Save the updated user document
  const updatedUser = await user.save();

  return res.status(200).json({
    success: true,
    message: "Your cart has been updated!",
    updatedUser,
  });
});

// user add product to cart by User Id
const updateUserCartByUserId = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { pid, quantity = 1, color, price, thumbnail, title } = req.body;

  // Check for missing inputs
  if (!pid || !color) {
    return res.status(400).json({
      success: false,
      message: "Missing input product ID or Color!",
    });
  }

  // Find the user by ID and select the cart field
  const user = await User.findById(uid).select("cart");

  // Check if the user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }

  // Check if the product already exists in the cart with the same color
  const existingProductIndex = user.cart.findIndex(
    (el) => el.product.toString() === pid && el.color === color
  );

  if (existingProductIndex > -1) {
    // Product exists in cart with the same color
    if (
      user.cart[existingProductIndex].quantity === quantity &&
      user.cart[existingProductIndex].price === price
    ) {
      return res.status(200).json({
        success: false,
        message: "This product added in your cart!",
        cart: user.cart,
      });
    }

    // Update quantity and price if different
    user.cart[existingProductIndex].quantity = quantity;
    user.cart[existingProductIndex].price = price;
    user.cart[existingProductIndex].thumbnail = thumbnail;
    user.cart[existingProductIndex].title = title;
  } else {
    // Product does not exist or exists with a different color, add new item
    user.cart.push({
      product: pid,
      quantity,
      color,
      price,
      thumbnail,
      title,
    });
  }

  // Save the updated user document
  const updatedUser = await user.save();

  return res.status(200).json({
    success: true,
    message: "User's cart has been updated!",
    updatedUser,
  });
});

// Function to remove a product from the user cart
const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { pid, color } = req.params;

  // Check for missing inputs
  if (!pid || !color) {
    return res.status(400).json({
      success: false,
      message: "Missing product ID or color!",
    });
  }

  // Find the user by ID and select the cart field
  const user = await User.findById(_id).select("cart");

  // Check if the user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }

  // Find the index of the product to remove
  const productIndex = user.cart.findIndex(
    (item) => item.product.toString() === pid && item.color === color
  );

  if (productIndex > -1) {
    // Remove the product from the cart
    user.cart.splice(productIndex, 1);

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Product removed from cart!",
      updatedUser,
    });
  } else {
    // Product not found in cart
    return res.status(404).json({
      success: false,
      message: "Product not found in cart!",
    });
  }
});

// tao example user
const generateUsers = asyncHandler(async (req, res) => {
  const response = await User.create(users);
  return res.status(200).json({
    success: response ? true : false,
    users: response ? response : "Something went wrong!",
  });
});

// tao wishlist
const updateWishlist = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { _id } = req.user;
  const user = await User.findById(_id);
  const alreadyInWishlist = user.wishlist?.find((el) => el.toString() === pid);
  if (alreadyInWishlist) {
    const response = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: pid } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      message: response ? "Updated wishlisted!" : "Something went wrong!",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: pid } },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      message: response ? "Updated wishlisted!" : "Something went wrong!",
    });
  }
});

// Remove wishlish by userid pid
const removeWishlistById = asyncHandler(async (req, res) => {
  const { userId, pid } = req.params;
  // Find the user by ID and remove the product from the wishlist
  const response = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: pid } },
    { new: true }
  );
  // Check if the update was successful
  if (response) {
    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist!",
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Failed to remove product from wishlist!",
    });
  }
});
// Function to remove a product from the user cart
const removeProductInCartByUserId = asyncHandler(async (req, res) => {
  const { uid, pid, color } = req.params;

  // Check for missing inputs
  if (!uid || !pid || !color) {
    return res.status(400).json({
      success: false,
      message: "Missing user ID, product ID, or color!",
    });
  }

  // Find the user by ID and select the cart field
  const user = await User.findById(uid).select("cart");

  // Check if the user exists
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }

  // Find the index of the product to remove
  const productIndex = user.cart.findIndex(
    (item) => item.product.toString() === pid && item.color === color
  );

  if (productIndex > -1) {
    // Remove the product from the cart
    user.cart.splice(productIndex, 1);

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Product removed from cart!",
      cart: updatedUser.cart,
    });
  } else {
    // Product not found in cart
    return res.status(404).json({
      success: false,
      message: "Product not found in cart!",
    });
  }
});

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateUserAddress,
  updateUserCart,
  updateUserCartByUserId,
  completeRegister,
  generateUsers,
  removeProductInCart,
  updateWishlist,
  getUserById,
  removeWishlistById,
  removeProductInCartByUserId,
  getUserByEmailOrMobile,
  updateCouponToUser,
};
