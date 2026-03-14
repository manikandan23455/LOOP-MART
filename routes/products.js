const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductDetail,
  getSellerDashboard,
  getNewProduct,
  postNewProduct,
  getEditProduct,
  putEditProduct,
  deleteProduct,
} = require('../controllers/productController');
const { isAuthenticated, isSeller } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Seller routes (must come before /:id)
router.get('/seller/dashboard', isAuthenticated, isSeller, getSellerDashboard);
router.get('/seller/new', isAuthenticated, isSeller, getNewProduct);
router.post('/seller/new', isAuthenticated, isSeller, upload.array('images', 5), postNewProduct);
router.get('/seller/edit/:id', isAuthenticated, isSeller, getEditProduct);
router.put('/seller/edit/:id', isAuthenticated, isSeller, upload.array('images', 5), putEditProduct);
router.delete('/seller/delete/:id', isAuthenticated, isSeller, deleteProduct);

// Public product routes
router.get('/', getAllProducts);
router.get('/:id', getProductDetail);

module.exports = router;
