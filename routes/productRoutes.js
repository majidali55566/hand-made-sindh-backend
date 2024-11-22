const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  getPaginatedProducts,
  searchProducts,
} = require("../controllers/productControllers");
const { authenticateToken } = require("../middleware/verifyJwt");

// Routes for product management
router.post("/", authenticateToken, createProduct); // Create product
router.put("/:id", authenticateToken, updateProduct); // Update product
router.delete("/:id", authenticateToken, deleteProduct); // Delete product
// router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/", getPaginatedProducts);
router.get("/:id", getProductById);
module.exports = router;
