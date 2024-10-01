const mongoose = require("mongoose");
const { Schema } = mongoose;

// Order Schema
const orderSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      description: "Reference to the User who placed the order (buyer).",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      description: "Reference to the Seller who sold the products.",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "PayPal", "Cash on Delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    totalPrice: {
      type: Number,
      required: true,
      description:
        "Total price of the order including all products and applicable taxes.",
    },
    orderNotes: {
      type: String,
      description: "Optional notes provided by the buyer during checkout.",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
