const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  selectedColor: {
    type: String,
  },
  selectedSize: {
    type: String,
  },
  addAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [CartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
