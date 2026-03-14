const express = require('express');
const router = express.Router();
const {
  getRentalProducts,
  getRentForm,
  postRent,
  getMyRentals,
  getRentalDetail,
  returnRental,
} = require('../controllers/rentalController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', getRentalProducts);
router.get('/my-rentals', isAuthenticated, getMyRentals);
router.get('/detail/:id', isAuthenticated, getRentalDetail);
router.post('/return/:id', isAuthenticated, returnRental);
router.get('/rent/:id', isAuthenticated, getRentForm);
router.post('/rent/:id', isAuthenticated, postRent);

module.exports = router;
