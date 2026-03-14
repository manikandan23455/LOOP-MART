const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  getCheckout,
  postCheckout,
  getMyOrders,
  getOrderDetail,
} = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getMyOrders);
router.get('/checkout', isAuthenticated, getCheckout);
router.post('/checkout', isAuthenticated, postCheckout);
router.get('/:id', isAuthenticated, getOrderDetail);

module.exports = router;
