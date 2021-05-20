const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-password-otp', authController.verifyPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);

// Token
router
  .route('/token')
  .get(authController.renewAccessToken)
  .delete(authController.revokeToken);

// Users
router
  .route('/me')
  .get(
    authController.protect,
    userController.getMe,
    userController.getUserById
  );

module.exports = router;
