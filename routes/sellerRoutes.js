const express = require("express");

const {
  becomeASeller,
  getSellerInfo,
  getAllProducts,
} = require("../controllers/sellerControllers");
const { authenticateToken } = require("../middleware/verifyJwt");
const router = express.Router();

router.post("/become-a-seller", authenticateToken, becomeASeller);
router.get("/info", authenticateToken, getSellerInfo);
router.get("/products", authenticateToken, getAllProducts);
module.exports = router;
