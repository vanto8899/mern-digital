const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const sendMail = require("../ultils/sendMail");
const axios = require("axios").default; // npm install axios
const CryptoJS = require("crypto-js"); // npm install crypto-js
const moment = require("moment"); // npm install moment
const qs = require("qs");

// APP ZALOPAY INFO
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user; // Get user ID from token
  const { products, total, address, status, paymentStatus, message, couponId } =
    req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid products array provided.",
    });
  }

  // Check product stock before proceeding with order creation
  for (let product of products) {
    const { product: productId, quantity: orderedQuantity } = product;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is missing in one of the items.",
      });
    }

    const productDetails = await Product.findById(productId);
    if (!productDetails) {
      return res.status(400).json({
        success: false,
        error: `Product with ID ${productId} not found.`,
      });
    }

    if (productDetails.quantity < orderedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for product: ${productDetails.title}. Available quantity: ${productDetails.quantity}.`,
      });
    }
  }

  // Update user's address and clear cart if address is provided
  if (address) {
    await User.findByIdAndUpdate(_id, { cart: [] });
  }

  // Remove coupon if any and couponId is provided
  if (couponId) {
    await User.findByIdAndUpdate(_id, { coupon: null });
  }
  if (message) {
    await User.findByIdAndUpdate(_id, { message: "" });
  }

  // Generate a unique orderCode
  const currentDate = new Date();
  const orderCode = `ORD-${currentDate.getFullYear()}${(
    currentDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Fetch user email
  const user = await User.findById(_id);
  const userEmail = user.email;

  // Generate a unique appTransId
  const appTransId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`; // generate trans id

  // Prepare data for creating the order
  const data = {
    orderCode, // Include the generated orderCode
    products,
    total,
    orderBy: _id,
    address,
    name: user.lastname,
    email: user.email,
    mobile: user.mobile,
    message: message,
    coupon: couponId,
    appTransId,
  };

  if (status) {
    data.status = status;
  }

  if (paymentStatus) {
    data.paymentStatus = paymentStatus;
  }

  // Create the order
  const createdOrder = await Order.create(data);

  // Check if order was successfully created
  if (!createdOrder) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong while creating the order.",
    });
  }

  // Update sold and quantity for each product in the order
  for (let product of products) {
    const { product: productId, quantity: orderedQuantity } = product;

    // Update sold and quantity in Product collection
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { sold: orderedQuantity, quantity: -orderedQuantity },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        error: `Failed to update product with ID ${productId}.`,
      });
    }
  }

  // Create order confirmation email content
  let productsHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Thumbnail</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Product</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Color</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Quantity</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  products.forEach((product) => {
    productsHtml += `
      <tr>
        <td style="border: 1px solid gray; padding: 8px;">
          <img src="${product.thumbnail}" alt="${product.title}" width="100" height="100">
        </td>
        <td style="border: 1px solid gray; padding: 8px;">${product.title}</td>
        <td style="border: 1px solid gray; padding: 8px;">${product.color}</td>
        <td style="border: 1px solid gray; padding: 8px;">${product.quantity}</td>
        <td style="border: 1px solid gray; padding: 8px;">VND ${product.price}</td>
      </tr>
    `;
  });

  productsHtml += `
      </tbody>
    </table>
  `;

  const emailHtml = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order. Your order code is: <strong>${orderCode}</strong></p>
    ${productsHtml}
    <p>Total Order (Included shipping fee): VND ${total}</p>
  `;

  await sendMail({
    email: userEmail,
    subject: "Order Confirmation",
    html: emailHtml,
  });

  // Return success response with created order
  return res.status(201).json({
    success: true,
    order: createdOrder,
  });
});

// Create Order by UserId
const createOrderByUserId = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { products, total, address, status, paymentStatus, message, couponId } =
    req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid products array provided.",
    });
  }

  // Check product stock before proceeding with order creation
  for (let product of products) {
    const { product: productId, quantity: orderedQuantity } = product;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is missing in one of the items.",
      });
    }

    const productDetails = await Product.findById(productId);
    if (!productDetails) {
      return res.status(400).json({
        success: false,
        error: `Product with ID ${productId} not found.`,
      });
    }

    if (productDetails.quantity < orderedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for product: ${productDetails.title}. Available quantity: ${productDetails.quantity}.`,
      });
    }
  }

  // Update user's address and clear cart if address is provided
  if (address) {
    await User.findByIdAndUpdate(uid, { cart: [] });
  }

  // Generate a unique orderCode
  const currentDate = new Date();
  const orderCode = `ORD-${currentDate.getFullYear()}${(
    currentDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Fetch user email
  const user = await User.findById(uid);
  const userEmail = user.email;

  // Generate a unique appTransId
  const appTransId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`; // generate trans id

  // Prepare data for creating the order
  const data = {
    orderCode, // Include the generated orderCode
    products,
    total,
    orderBy: uid,
    address,
    name: user.lastname,
    email: user.email,
    mobile: user.mobile,
    message: message,
    coupon: couponId,
    appTransId: appTransId,
  };

  if (status) {
    data.status = status;
  }

  if (paymentStatus) {
    data.paymentStatus = paymentStatus;
  }

  // Create the order
  const createdOrder = await Order.create(data);

  // Check if order was successfully created
  if (!createdOrder) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong while creating the order.",
    });
  }

  // Update sold and quantity for each product in the order
  for (let product of products) {
    const { _id: productId } = product.product;
    const { quantity: orderedQuantity } = product;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is missing in one of the items.",
      });
    }

    // Update sold and quantity in Product collection
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { sold: orderedQuantity, quantity: -orderedQuantity },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        error: `Failed to update product with ID ${productId}.`,
      });
    }
  }

  // Create order confirmation email content
  let productsHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Thumbnail</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Product</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Color</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Quantity</th>
          <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  products.forEach((product) => {
    productsHtml += `
      <tr>
        <td style="border: 1px solid gray; padding: 8px;">
          <img src="${product.thumbnail}" alt="${product.title}" width="100" height="100">
        </td>
        <td style="border: 1px solid gray; padding: 8px;">${product.title}</td>
        <td style="border: 1px solid gray; padding: 8px;">${product.color}</td>
        <td style="border: 1px solid gray; padding: 8px;">${product.quantity}</td>
        <td style="border: 1px solid gray; padding: 8px;">VND ${product.price}</td>
      </tr>
    `;
  });

  productsHtml += `
      </tbody>
    </table>
  `;

  const emailHtml = `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order. Your order code is: <strong>${orderCode}</strong></p>
    ${productsHtml}
    <p>Total Order (Included shipping fee): VND ${total}</p>
  `;

  await sendMail({
    email: userEmail,
    subject: "Order Confirmation",
    html: emailHtml,
  });

  // Update user's coupon and message fields after order creation
  await User.findByIdAndUpdate(uid, { coupon: null, message: "" });

  // Return success response with created order
  return res.status(201).json({
    success: true,
    order: createdOrder,
  });
});

// Create Order and payment zalopay
const createZalopayOrder = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { products, total, address, status, paymentStatus, message, couponId } =
    req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid products array provided.",
    });
  }

  // Check product stock before proceeding with order creation
  for (let product of products) {
    const { product: productId, quantity: orderedQuantity } = product;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is missing in one of the items.",
      });
    }

    const productDetails = await Product.findById(productId);
    if (!productDetails) {
      return res.status(400).json({
        success: false,
        error: `Product with ID ${productId} not found.`,
      });
    }

    if (productDetails.quantity < orderedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for product: ${productDetails.title}. Available quantity: ${productDetails.quantity}.`,
      });
    }
  }

  // Update user's address and clear cart if address is provided
  if (address) {
    await User.findByIdAndUpdate(uid, { cart: [] });
  }

  // Generate a unique orderCode
  const currentDate = new Date();
  const orderCode = `ORD-${currentDate.getFullYear()}${(
    currentDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Fetch user email
  const user = await User.findById(uid);
  const userEmail = user.email;

  // Prepare data for creating the order
  const data = {
    orderCode, // Include the generated orderCode
    products,
    total,
    orderBy: uid,
    address,
    name: user.lastname,
    email: user.email,
    mobile: user.mobile,
    message: message,
    coupon: couponId,
    appTransId: "", // Placeholder for app_trans_id
  };

  if (status) {
    data.status = status;
  }

  if (paymentStatus) {
    data.paymentStatus = paymentStatus;
  }

  // Create the order
  const createdOrder = await Order.create(data);

  // Check if order was successfully created
  if (!createdOrder) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong while creating the order.",
    });
  }

  // Proceed with ZaloPay payment
  const embed_data = {
    redirecturl: "http://localhost:3000/checkout/",
  };

  const items = products.map((product) => ({
    id: product.product._id,
    name: product.product.title,
    price: product.price,
    quantity: product.quantity,
  }));

  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // generate trans id
    app_user: userEmail,
    app_time: Date.now(),
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: Math.round(total), // Ensure amount is an integer
    description: `E-Shopper - Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://4eb6-2402-800-6343-6d1c-edb6-888c-343d-b007.ngrok-free.app/api/order/callback-zalopay",
    // ngrok convert link update when run backend
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const dataString =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;

  order.mac = CryptoJS.HmacSHA256(dataString, config.key1).toString();

  try {
    //console.log("Order Data:", order);

    const paymentResult = await axios.post(config.endpoint, null, {
      params: order,
    });
    //console.log("Payment Result:", paymentResult.data);

    // Update order with payment information and app_trans_id
    createdOrder.status = "Succeed";
    createdOrder.paymentStatus =
      paymentResult.data.return_code === 1 ? "Pending" : "Failed";
    createdOrder.appTransId = order.app_trans_id;
    await createdOrder.save();

    // Create order confirmation email content
    let productsHtml = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Thumbnail</th>
            <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Product</th>
            <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Color</th>
            <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Quantity</th>
            <th style="border: 1px solid gray; padding: 8px; background-color: #ee3131; color: white">Price</th>
          </tr>
        </thead>
        <tbody>
    `;

    products.forEach((product) => {
      productsHtml += `
        <tr>
          <td style="border: 1px solid gray; padding: 8px;">
            <img src="${product.thumbnail}" alt="${product.title}" width="100" height="100">
          </td>
          <td style="border: 1px solid gray; padding: 8px;">${product.title}</td>
          <td style="border: 1px solid gray; padding: 8px;">${product.color}</td>
          <td style="border: 1px solid gray; padding: 8px;">${product.quantity}</td>
          <td style="border: 1px solid gray; padding: 8px;">VND ${product.price}</td>
        </tr>
      `;
    });

    productsHtml += `
        </tbody>
      </table>
    `;

    const emailHtml = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order. Your order code is: <strong>${orderCode}</strong></p>
      ${productsHtml}
      <p>Total Order (Included shipping fee): VND ${total}</p>
    `;

    await sendMail({
      email: userEmail,
      subject: "Order Confirmation",
      html: emailHtml,
    });

    // Update sold and quantity for each product in the order
    for (let product of products) {
      const { _id: productId } = product.product;
      const { quantity: orderedQuantity } = product;

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: "Product ID is missing in one of the items.",
        });
      }

      // Update sold and quantity in Product collection
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $inc: { sold: orderedQuantity, quantity: -orderedQuantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(500).json({
          success: false,
          error: `Failed to update product with ID ${productId}.`,
        });
      }
    }

    // Update user's coupon and message fields after order creation
    await User.findByIdAndUpdate(uid, { coupon: null, message: "" });

    // Return success response with created order
    return res.status(201).json({
      success: true,
      order: createdOrder,
      paymentResponse: {
        ...paymentResult.data,
        app_trans_id: order.app_trans_id, // Include app_trans_id in the response
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: "Payment failed. Please try again!",
    });
  }
});

// Update order information
const updateOrderInformation = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const { email, name, mobile, address, message, status, paymentStatus } =
    req.body;

  // Validate input
  if (!oid) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required!" });
  }

  // Update the order
  const updatedOrder = await Order.findByIdAndUpdate(
    oid,
    {
      name,
      email,
      mobile,
      address,
      message,
      status,
      paymentStatus,
      updatedAt: Date.now(), // Update the `updatedAt` field
    },
    { new: true, runValidators: true }
  );

  if (!updatedOrder) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found!" });
  }

  return res.status(200).json({
    success: true,
    message: "Order information updated successfully!",
    order: updatedOrder,
  });
});

// update order by id
const updateOrderById = asyncHandler(async (req, res) => {
  const { uid, oid } = req.params; // Get user ID and order ID from URL parameters
  const { products, total, couponId } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid products array provided.",
    });
  }

  // Fetch the order to update
  const existingOrder = await Order.findById(oid);

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      error: "Order not found.",
    });
  }

  // Hoàn tác số lượng sản phẩm từ đơn hàng hiện tại
  for (let existingProduct of existingOrder.products) {
    const { _id: productId } = existingProduct.product;
    const { quantity: orderedQuantity } = existingProduct;

    // Hoàn tác số lượng
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { sold: -orderedQuantity, quantity: orderedQuantity },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        error: `Failed to revert product with ID ${productId}.`,
      });
    }
  }

  // Prepare data for updating the order
  const data = {
    products,
    total,
  };

  // Validate couponId if provided
  if (couponId) {
    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid coupon ID provided.",
      });
    }
    data.coupon = couponId;
  }

  // Update the order
  const updatedOrder = await Order.findByIdAndUpdate(oid, data, {
    new: true,
  });

  // Check if order was successfully updated
  if (!updatedOrder) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong while updating the order.",
    });
  }

  // Cập nhật số lượng sản phẩm mới
  for (let product of products) {
    const { product: productId } = product;
    const { quantity: orderedQuantity } = product;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is missing in one of the items.",
      });
    }
    //console.log(productId);

    // Update sold and quantity in Product collection
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { sold: orderedQuantity, quantity: -orderedQuantity },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        error: `Failed to update product with ID ${productId}.`,
      });
    }
  }
  // Update user's coupon and message fields after order creation
  await User.findByIdAndUpdate(uid, { coupon: null, message: "" });

  // Return success response with updated order and a message
  return res.status(200).json({
    success: true,
    message: "Order updated!",
    order: updatedOrder,
  });
});

// delete order
const deleteOrder = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  // Validate input
  if (!oid) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required!" });
  }
  const deletedOrder = await Order.findByIdAndDelete(oid);

  if (!deletedOrder) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found!" });
  }
  return res.status(200).json({
    success: true,
    message: "Order deleted successfully!",
    order: deletedOrder,
  });
});

// Hàm xử lý xóa sản phẩm khỏi đơn hàng
const removeProductFromOrder = asyncHandler(async (req, res) => {
  const { oid, pid } = req.params;

  // Validate input
  if (!oid || !pid) {
    return res.status(400).json({
      success: false,
      message: "Order ID and Product ID are required!",
    });
  }

  // Find the order by ID
  const order = await Order.findById(oid);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found!",
    });
  }

  // Check if the product exists in the order
  const productIndex = order.products.findIndex(
    (product) => product.product.toString() === pid
  );
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product not found or already deleted in order!",
    });
  }

  // Check if there's only one product left in the order
  if (order.products.length === 1) {
    return res.status(400).json({
      success: false,
      message: "Cannot remove the last product in order!",
    });
  }

  // Update the order to remove the product
  order.products.splice(productIndex, 1); // Remove the product from the array
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Product removed from order!",
    order,
  });
});

// Them san pham vao order theo oid
const addProductToOrder = asyncHandler(async (req, res) => {
  const { oid } = req.params; // Order ID from URL parameters
  const { product, quantity, color, price, thumbnail, title } = req.body; // Product details from request body

  // Validate input
  if (!oid || !product || !quantity || !price || !title) {
    return res.status(400).json({
      success: false,
      message: "Order ID, product, quantity, price, and title are required!",
    });
  }

  // Find the order by ID
  const order = await Order.findById(oid);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found!",
    });
  }

  // Check if the product already exists in the order
  const existingProductIndex = order.products.findIndex(
    (p) => p.product.toString() === product
  );

  if (existingProductIndex !== -1) {
    // Product exists in the order, update the quantity
    order.products[existingProductIndex].quantity += quantity;
    order.products[existingProductIndex].price = price;
    order.products[existingProductIndex].color = color;
    order.products[existingProductIndex].thumbnail = thumbnail;
    order.products[existingProductIndex].title = title;
  } else {
    // Product does not exist in the order, add new product
    order.products.push({
      product,
      quantity,
      color,
      price,
      thumbnail,
      title,
    });
  }

  // Update the total price of the order
  order.total += price * quantity;

  // Save the updated order
  const updatedOrder = await order.save();

  return res.status(200).json({
    success: true,
    message: "Product added to order successfully!",
    order: updatedOrder,
  });
});

// Get user orders
const getUserOrder = asyncHandler(async (req, res) => {
  let queries = { ...req.query };
  const { _id } = req.user;

  // Fields to exclude from the query
  const excludeFields = [
    "limit",
    "sort",
    "page",
    "fields",
    "orderCode",
    "createdAtFrom",
    "createdAtTo",
  ];
  excludeFields.forEach((el) => delete queries[el]);

  // Format the query for comparison operators
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte)\b/g,
    (matchEl) => `$${matchEl}`
  );
  let formattedQueries = JSON.parse(queryString);

  // Filter by orderCode
  if (req.query.orderCode) {
    const orderCodeRegex = new RegExp(req.query.orderCode, "i");
    formattedQueries.orderCode = { $regex: orderCodeRegex };
  }

  // Filter by createdAt range
  if (req.query.createdAtFrom && req.query.createdAtTo) {
    const createdAtToDate = new Date(req.query.createdAtTo);
    createdAtToDate.setHours(23, 59, 59, 999); // Set to the end of the day

    formattedQueries.createdAt = {
      $gte: new Date(req.query.createdAtFrom),
      $lte: createdAtToDate,
    };
  } else if (req.query.createdAtFrom) {
    formattedQueries.createdAt = {
      $gte: new Date(req.query.createdAtFrom),
    };
  } else if (req.query.createdAtTo) {
    const createdAtToDate = new Date(req.query.createdAtTo);
    createdAtToDate.setHours(23, 59, 59, 999); // Set to the end of the day

    formattedQueries.createdAt = {
      $lte: createdAtToDate,
    };
  }

  // Add filter for orders belonging to the user
  const qr = { ...formattedQueries, orderBy: _id };

  // Build the MongoDB query command
  let queryCommand = Order.find(qr);

  // Apply sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Apply field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Apply pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit =
    parseInt(req.query.limit, 10) ||
    parseInt(process.env.PAGE_LIMIT_PRODUCTS, 10);
  const skip = (page - 1) * limit;

  queryCommand = queryCommand.skip(skip).limit(limit);

  // Execute the query and count the total matching documents
  const orders = await queryCommand.exec();
  const counts = await Order.countDocuments(qr);

  return res.status(200).json({
    success: true,
    counts,
    orders,
  });
});

// Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
  let queries = { ...req.query };
  const { _id } = req.user;

  // Fields to exclude
  const excludeFields = [
    "limit",
    "sort",
    "page",
    "fields",
    "orderCode",
    "createdAtFrom",
    "createdAtTo",
  ];
  excludeFields.forEach((el) => delete queries[el]);

  // Format query
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte)\b/g,
    (matchEl) => `$${matchEl}`
  );
  let formattedQueries = JSON.parse(queryString);

  // Filter by orderCode
  if (req.query.orderCode) {
    const orderCodeRegex = new RegExp(req.query.orderCode, "i");
    formattedQueries.orderCode = { $regex: orderCodeRegex };
  }

  // Filter by createdAt range
  if (req.query.createdAtFrom && req.query.createdAtTo) {
    const createdAtToDate = new Date(req.query.createdAtTo);
    createdAtToDate.setHours(23, 59, 59, 999); // Set to the end of the day

    formattedQueries.createdAt = {
      $gte: new Date(req.query.createdAtFrom),
      $lte: createdAtToDate,
    };
  } else if (req.query.createdAtFrom) {
    formattedQueries.createdAt = {
      $gte: new Date(req.query.createdAtFrom),
    };
  } else if (req.query.createdAtTo) {
    const createdAtToDate = new Date(req.query.createdAtTo);
    createdAtToDate.setHours(23, 59, 59, 999); // Set to the end of the day

    formattedQueries.createdAt = {
      $lte: createdAtToDate,
    };
  }

  const qr = { ...formattedQueries };
  let queryCommand = Order.find(qr);

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
  const orders = await queryCommand.exec();
  const counts = await Order.countDocuments(qr);

  return res.status(200).json({
    success: true,
    counts,
    orders,
  });
});

// get all order no limit
const getAllOrderNoLmit = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  const counts = await Order.countDocuments();

  return res.status(200).json({
    success: true,
    counts,
    orders,
  });
});

// Get order by order Id
const getOrderById = asyncHandler(async (req, res) => {
  const { oid } = req.params;

  const order = await Order.findById(oid);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

// Payment Zalopay
const paymentZalopay = asyncHandler(async (req, res) => {
  const embed_data = {
    redirecturl: "http://localhost:3000/",
  };

  const items = [{}]; // product info
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // generate trans id
    app_user: "user123",
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: 50000,
    description: `E-Shopper - Payment for the order #${transID}`,
    bank_code: "",
    callback_url:
      "https://8090-115-77-117-234.ngrok-free.app/api/order/callback-zalopay", // ngrok convert link
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  try {
    const result = await axios.post(config.endpoint, null, { params: order });
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error.message);
  }
});

// Payment Zalopay callback
const paymentZalopayCallback = asyncHandler(async (req, res) => {
  let result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr);
      //console.log("Received payment status update:", dataJson);
      // Xác định trạng thái thanh toán từ trường khác nếu không có return_code
      const paymentStatus = dataJson.amount > 0 ? "Completed" : "Failed";

      // Emit paymentStatusUpdated event
      console.log("Emitting paymentStatusUpdated event:", {
        app_trans_id: dataJson["app_trans_id"],
        paymentStatus,
      });
      // Find and update the order using app_trans_id
      const appTransId = dataJson["app_trans_id"];
      const order = await Order.findOneAndUpdate(
        { appTransId: appTransId },
        { paymentStatus: paymentStatus },
        { new: true }
      );

      if (order) {
        console.log(
          `Order with app_trans_id ${appTransId} updated. New payment status: ${order.paymentStatus}`
        );
        result.return_code = 1;
        result.return_message = "success";
      } else {
        console.log(`Order with app_trans_id ${appTransId} not found.`);
        result.return_code = 0;
        result.return_message = `Order with app_trans_id ${appTransId} not found.`;
      }
      // initial websocket
      io.emit("paymentStatusUpdated", {
        app_trans_id: dataJson["app_trans_id"],
        paymentStatus,
      });
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
});

// Payment order status
const paymentZalopayOrderStatus = asyncHandler(async (req, res) => {
  const app_trans_id = req.params.app_trans_id;
  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id, // Input your app_trans_id
  };

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: "post",
    url: "https://sb-openapi.zalopay.vn/v2/query",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };
  try {
    const result = await axios(postConfig);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = {
  createOrder,
  updateOrderInformation,
  updateOrderById,
  getUserOrder,
  getAllOrders,
  deleteOrder,
  removeProductFromOrder,
  getOrderById,
  addProductToOrder,
  getAllOrderNoLmit,
  createOrderByUserId,
  paymentZalopay,
  paymentZalopayCallback,
  paymentZalopayOrderStatus,
  createZalopayOrder,
};
