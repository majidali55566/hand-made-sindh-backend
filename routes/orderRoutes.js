const express = require("express");
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderControllers");
const { authenticateToken } = require("../middleware/verifyJwt");
const { addEstimatedArrivalDate } = require("../controllers/orderControllers");

const router = express.Router();

router.post("/", authenticateToken, createOrder);
router.get("/", authenticateToken, getBuyerOrders);
router.get("/seller", authenticateToken, getSellerOrders);
router.patch("/add-estimated-date", authenticateToken, addEstimatedArrivalDate);
router.patch("/update-status", authenticateToken, updateOrderStatus);
module.exports = router;
