const CartModel = require("../models/Cart.model");
const OrderModel = require("../models/Order.model");
const ProductModel = require("../models/Product.model");

exports.createOrder = async (req, res) => {
  try {
    const { buyerId, shippingAddress, paymentMethod, orderNotes } = req.body;

    // Fetch user's cart
    const cart = await CartModel.findOne({ user: buyerId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" }); // Fix message here
    }

    // Group products by sellerId
    const sellerOrders = cart.items.reduce((acc, item) => {
      const sellerId = item.product.sellerId; // Assuming product has a sellerId
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.discountedPrice,
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
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderNotes,
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
