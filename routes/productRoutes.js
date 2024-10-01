const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
} = require("../controllers/productControllers");
const { authenticateToken } = require("../middleware/verifyJwt");

// Routes for product management
router.post("/", authenticateToken, createProduct); // Create product
router.put("/:id", authenticateToken, updateProduct); // Update product
router.delete("/:id", authenticateToken, deleteProduct); // Delete product
router.get("/", getAllProducts);
router.get("/:id", getProductById);
module.exports = router;
