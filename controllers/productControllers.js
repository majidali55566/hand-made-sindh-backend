const mongoose = require("mongoose");
const Product = require("../models/Product.model");
const Seller = require("../models/Seller.model");

exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    discountedPrice,
    stock,
    categories,
    colors,
    sizes,
    images,
  } = req.body;

  const userId = req.user.id; // Assuming req.user contains the authenticated user's ID
  try {
    // Find the seller using the userId
    const seller = await Seller.findOne({ userId });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Create the new product
    const newProduct = await Product.create({
      sellerId: seller._id, // Reference the seller's _id
      name,
      description,
      price,
      discountedPrice,
      stock,
      categories,
      colors,
      sizes,
      images,
    });

    // Update the seller's products array
    seller.products.push(newProduct._id);
    await seller.save(); // Save the updated seller document

    res.status(201).json({
      success: true,
      product: newProduct,
      seller,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error creating product: ${error.message}`,
    });
  }
};

// Controller to update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request parameters

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body }, // Use the request body to update fields
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// Controller to delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request parameters

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products.length) {
      return res.status(404).json({ message: "No products found." });
    }
    res.status(200).json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product Id" });
    }
    const product = await Product.findById(id).populate({
      path: "sellerId",
      select: "storeName",
    });
    if (!product) return res.status(404).json({ message: "Prouct not found" });

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};