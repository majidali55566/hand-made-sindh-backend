const mongoose = require("mongoose");
const { Schema } = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    authProvider: {
      type: String,
      enum: ["google", "facebook", "email"],
      required: true,
    },
    profilePicture: {
      type: String,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    // Additional fields like role, phone number, etc., can be added
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
