const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User schema
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Ratings between 1 and 5
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please enter the product name"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter the product description"],
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter the product price"],
      maxLength: [5, "Price cannot exceed 5 characters"],
      default: 0.0,
    },
    discountedPrice: {
      type: Number,
      default: 0.0, // Optional field for discounted price
    },
    stock: {
      type: Number,
      required: [true, "Please enter the product stock"],
      maxLength: [5, "Stock cannot exceed 5 characters"],
      default: 0,
    },
    categories: [{ type: String, required: true }],
    colors: {
      type: [String], // List of available colors for the product
    },
    sizes: {
      type: [String], // List of available sizes for the product
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    ratings: {
      type: Number,
      default: 0, // Average rating, calculated from reviews
    },
    reviews: [reviewSchema], // Embedded reviews schema
    numOfReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false, // Flag for marking a product as featured
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
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

module.exports = mongoose.model("Product", productSchema);
