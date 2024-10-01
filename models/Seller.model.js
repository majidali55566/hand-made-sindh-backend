const mongoose = require("mongoose");
const { Schema } = mongoose;

const SellerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    description: "Reference to the user's ID from the User schema.",
  },
  storeName: {
    type: "String",
    required: true,
    description: "Name of the seller's store.",
  },
  storeDescription: {
    type: "String",
    description: "Description of the seller's store.",
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  address: { type: String },
  contact: { type: String },
  zipCode: { type: String },

  createdAt: {
    type: Date,
    default: Date.now,
    description: "Date when the seller registered.",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: "Last updated date for the seller’s information.",
  },
});

SellerSchema.index({ userId: 1 });

module.exports = mongoose.model("Seller", SellerSchema);
