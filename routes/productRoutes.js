const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productControllers');

const router = express.Router();

router.route('/').get(productController.getAllProducts);

router
  .route('/user')
  .get(authController.protect, productController.getProductByUserId)
  .post(authController.protect, productController.createUserProduct);

router
  .route('/:id')
  .get(productController.getProductById)
  .patch(authController.protect, productController.updateProductById);

module.exports = router;
