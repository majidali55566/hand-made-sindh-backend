const express = require("express");
const {
  getUserCart,
  addToCart,
  updateQuantity,
  deleteItemFromCart,
} = require("../controllers/cartController");
const { authenticateToken } = require("../middleware/verifyJwt");

const router = express.Router();

router.get("/", authenticateToken, getUserCart);
router.post("/", authenticateToken, addToCart);
router.put("/update-quantity", authenticateToken, updateQuantity);
router.post("/products/delete", authenticateToken, deleteItemFromCart);
module.exports = router;
