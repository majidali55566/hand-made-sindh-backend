const express = require("express");
const router = express.Router();
const {
  signUpWithEmail,
  signUpWithGoogle,
  signUpWithFacebook,
  signInWithEmail,
} = require("../controllers/authControllers");

// Sign up with email
router.post("/signup/email", signUpWithEmail);

router.post("/signin/email", signInWithEmail);

// Sign up or login with Google
router.post("/signup/google", signUpWithGoogle);

// Sign up or login with Facebook
router.post("/signup/facebook", signUpWithFacebook);

module.exports = router;
