const CartModel = require("../models/Cart.model");
const OrderModel = require("../models/Order.model");
const ProductModel = require("../models/Product.model");
const SellerModel = require("../models/Seller.model");
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const { shippingDetails } = req.body;
    console.log(shippingDetails);
    const paymentMethod = "Cash on Delivery";
    const buyerId = req.user.id;

    // Fetch user's cart
    const cart = await CartModel.findOne({ user: buyerId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Group products by sellerId
    const sellerOrders = cart.items.reduce((acc, item) => {
      const sellerId = item.product.sellerId; // Assuming product has a sellerId
      console.log(sellerId);

      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.discountedPrice,
        selectedColor: item.selectedColor, // Include selectedColor
        selectedSize: item.selectedSize, // Include selectedSize
      });
      return acc;
    }, {});

    const orderPromises = [];

    // Create separate orders for each seller
    for (const sellerId in sellerOrders) {
      const products = sellerOrders[sellerId];
      const totalPrice = products.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const order = new OrderModel({
        buyerId,
        sellerId,
        products,
        shippingDetails,
        paymentMethod,
        totalPrice,
      });

      orderPromises.push(order.save());
    }

    // Save all orders to the database
    const savedOrders = await Promise.all(orderPromises);

    // Clear the cart after order creation
    await CartModel.findOneAndDelete({ user: buyerId });

    // Optionally, update the product stock
    for (const item of cart.items) {
      await ProductModel.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res
      .status(201)
      .json({ message: "Order placed successfully", orders: savedOrders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error placing order", error });
  }
};

exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id; // Authenticated buyer ID

    const orders = await OrderModel.find({ buyerId })
      .populate({
        path: "products.productId",
        select: "name images discountedPrice", // Include only required fields
      })
      .populate("sellerId", "name contact address") // Include seller details
      .sort({ createdAt: -1 })
      .lean(); // Convert documents to plain JavaScript objects

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this buyer." });
    }

    // Transform the orders for cleaner output
    const ordersWithDetails = orders.map((order) => ({
      ...order,
      products: order.products.map((product) => ({
        ...product,
        productName: product.productId?.name || null,
        productImage: product.productId?.images?.[0]?.url || null, // Include the URL of the first image
        discountedPrice: product.productId?.discountedPrice || null,
      })),
    }));

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: ordersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authenticated seller's ID

    // Find the seller using the userId
    const seller = await SellerModel.findOne({ userId });
    console.log("userId:", userId);
    console.log("sellerId:", seller._id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }
    const orders = await OrderModel.find({ sellerId: seller._id })
      .populate({
        path: "products.productId",
        select: "name images discountedPrice stock",
      })
      .populate("buyerId", "name email contact")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this seller." });
    }

    // Transform the orders for cleaner output
    const ordersWithDetails = orders.map((order) => ({
      ...order,
      products: order.products.map((product) => ({
        ...product,
        productName: product.productId?.name || null,
        productImage: product.productId?.images?.[0]?.url || null, // Include the URL of the first image
        discountedPrice: product.productId?.discountedPrice || null,
        stockRemaining: product.productId?.stock || null,
      })),
    }));

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders: ordersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;

    // Validate the new status
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Find and update the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Update the status
    order.orderStatus = newStatus;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status.",
      error,
    });
  }
};

exports.addEstimatedArrivalDate = async (req, res) => {
  const { orderId, estimatedDate } = req.body;

  // Validate the ObjectId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid Order ID" });
  }

  try {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { estimatedArrivalDate: estimatedDate },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("Updated Order:", updatedOrder);
    return res.status(200).json({
      message: "Estimated arrival date updated/added",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating estimated arrival date:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
