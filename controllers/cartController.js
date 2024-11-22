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

    // Find the index of the product in the cart with the same color and size
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.equals(productId) &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    let updatedItem;

    if (existingItemIndex > -1) {
      // Update the existing item with the same product, color, and size
      cart.items[existingItemIndex].quantity += quantity;

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
    const populatedItem = cart.items.find(
      (item) =>
        item.product._id.equals(productId) &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
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
  const { productId, selectedColor, selectedSize } = req.body;
  const userId = req.user.id;

  try {
    // Find the cart for the user
    const cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find the index of the item to be removed based on productId, selectedColor, and selectedSize
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.equals(productId) &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (itemIndex > -1) {
      // Remove the item if it exists
      cart.items.splice(itemIndex, 1);

      // Save the updated cart
      await cart.save();

      res.status(200).json({
        message: "Item removed from cart",
        productId, // Return the productId for reference
        selectedColor,
        selectedSize,
      });
    } else {
      // Item not found in the cart
      res.status(404).json({
        message: "Item not found in the cart",
      });
    }
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
