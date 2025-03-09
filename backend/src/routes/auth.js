const express = require("express");
const router = express.Router();
const authController = require("~/controllers/AuthController");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
// doi mat khau
router.post("/change-password", authController.changePassword);

// quen mat khau
router.post("/forgot-password", authController.forgotPassword);

// reset mat khau
router.post("/reset-password", authController.resetPassword);

module.exports = router;
