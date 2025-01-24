const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const CartModel = require("../models/Cart.model");

// Utility function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_KEY,
    {
      expiresIn: "24hr",
    }
  );
};

// Sign-up with email/password
exports.signUpWithEmail = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      authProvider: "email",
    });

    // Save the user in the database
    await newUser.save();

    //create a new Cart
    const newCart = new CartModel({
      user: newUser._id,
      items: [],
    });

    await newCart.save();

    // Generate token and send response
    const token = generateToken(newUser);
    res.status(200).json({ token, user: newUser, cart: newCart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Sign-in with email/password
exports.signInWithEmail = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userCart = await CartModel.findOne({ user: user._id });
    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token and send response
    const token = generateToken(user);
    res.status(200).json({ token, user, userCart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Sign-up or login with Google
exports.signUpWithGoogle = async (req, res) => {
  const { googleId, name, email, profilePicture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // If the user exists, update Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        await user.save();
      }
    } else {
      // If the user does not exist, create a new user
      user = new User({
        name,
        email,
        googleId,
        authProvider: "google",
        profilePicture: profilePicture || "",
      });

      await user.save();
      // Create a new empty cart for the user
      const newCart = new CartModel({
        user: user._id,
        items: [],
      });

      await newCart.save();
    }

    // Generate token and send response
    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Sign-up or login with Facebook
exports.signUpWithFacebook = async (req, res) => {
  const { facebookId, name, email, profilePicture } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If the user exists, update Facebook ID if not present
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.authProvider = "facebook";
        await user.save();
      }
    } else {
      // If the user does not exist, create a new user
      user = new User({
        name,
        email,
        facebookId,
        authProvider: "facebook",
        profilePicture: profilePicture || "",
      });

      await user.save();
      // Create a new empty cart for the user
      const newCart = new CartModel({
        user: user._id,
        items: [],
      });

      await newCart.save();
    }

    // Generate token and send response
    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
