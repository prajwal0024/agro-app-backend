const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Authentication
router.post('/signup', authController.signup);
router.post('/login', authController.login);

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
