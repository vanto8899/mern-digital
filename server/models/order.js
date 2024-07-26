const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    appTransId: {
      type: String,
      unique: true,
    },
    products: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: Number,
        color: String,
        price: Number,
        thumbnail: String,
        title: String,
      },
    ],
    status: {
      type: String,
      default: "Pending",
      enum: ["Cancelled", "Pending", "Succeed"],
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Failed", "Completed"],
    },
    total: Number,
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    mobile: {
      type: String,
    },
    message: {
      type: String,
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Order", orderSchema);
