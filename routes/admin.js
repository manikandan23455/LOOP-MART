const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  toggleUserStatus,
  getProducts,
  approveProduct,
  rejectProduct,
  getOrders,
  updateOrderStatus,
  getRentals,
  updateRentalStatus,
} = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated, isAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users/:id/toggle', toggleUserStatus);
router.get('/products', getProducts);
router.post('/products/:id/approve', approveProduct);
router.post('/products/:id/reject', rejectProduct);
router.get('/orders', getOrders);
router.post('/orders/:id/status', updateOrderStatus);
router.get('/rentals', getRentals);
router.post('/rentals/:id/status', updateRentalStatus);

module.exports = router;
