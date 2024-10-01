const User = require("../models/User.model");

const Seller = require("../models/Seller.model");

exports.becomeASeller = async (req, res) => {
  const { storeName, storeDescription, address, contact, zipCode, userId } =
    req.body;
  console.log(req.user.id);

  try {
    // Find user by the ID (req.user.id comes from authenticated user token)
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User with this id not found" });

    // Check if the user is already a seller
    if (user.role === "seller")
      return res.status(400).json({ message: "User is already a seller" });

    // Update user's role to "seller"
    user.role = "seller";
    await user.save();

    // Create a new Seller entry
    const newSeller = new Seller({
      userId: user._id,
      storeName,
      storeDescription,
      contact, // Add contact info to the Seller
      address, // Add address to the Seller
      zipCode, // Add zip code to the Seller
    });

    await newSeller.save();

    return res
      .status(201)
      .json({ message: "User has been successfully upgraded to seller" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSellerInfo = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  try {
    const seller = await Seller.findOne({ userId }).populate("userId");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching seller: ${error.message}`,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const seller = await Seller.findOne({ userId })
      .populate("products")
      .select("product");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.status(200).json(seller);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
