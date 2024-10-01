const CartModel = require("../models/Cart.model");

exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assume you have middleware that sets req.user
    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.product"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.addToCart = async (req, res) => {
  const userId = req.user.id; // Assume you have middleware that sets req.user
  const { productId, quantity, selectedColor, selectedSize } = req.body;

  try {
    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = new CartModel({ user: userId, items: [] });
    }

    // Find the index of the product in the cart
    const existingItemIndex = cart.items.findIndex((item) =>
      item.product.equals(productId)
    );

    let updatedItem;

    if (existingItemIndex > -1) {
      // Update the existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].selectedColor = selectedColor;
      cart.items[existingItemIndex].selectedSize = selectedSize;

      // Set updatedItem to the modified cart item
      updatedItem = cart.items[existingItemIndex];
    } else {
      // Add a new item to the cart
      const newItem = {
        product: productId,
        quantity,
        selectedColor,
        selectedSize,
      };

      cart.items.push(newItem);
      updatedItem = newItem;
    }

    // Save the cart after adding or updating the item
    await cart.save();

    // Populate the newly added or updated item with product details
    await cart.populate("items.product");

    // Find the updated item after population
    const populatedItem = cart.items.find((item) =>
      item.product._id.equals(productId)
    );

    // Return the updated or added item with the populated product
    res.status(200).json({
      message: "Cart updated successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateQuantity = async (req, res) => {
  const { quantity, productId } = req.body;
  const userId = req.user.id;

  try {
    const updatedCartItem = await CartModel.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true }
    );
    if (!updatedCartItem) {
      return res.status(400).json({ message: "Cart item couldn't be updated" });
    }
    res.status(200).json({
      cartItem: updatedCartItem,
      message: "Cart item quantity updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteItemFromCart = async (req, res) => {
  const { productId } = req.body;
  console.log(productId);
  const userId = req.user.id;

  try {
    const deletedItem = await CartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    );
    if (!deletedItem)
      return res.status(404).json({
        message: "Cart or Product not found",
      });
    res.status(200).json({ message: "Item removed from cart", id: productId });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
