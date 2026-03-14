const express = require('express');
const router = express.Router();
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getProfile,
  postUpdateProfile,
} = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

router.get('/register', isNotAuthenticated, getRegister);
router.post('/register', isNotAuthenticated, postRegister);
router.get('/login', isNotAuthenticated, getLogin);
router.post('/login', isNotAuthenticated, postLogin);
router.get('/logout', logout);
router.get('/profile', isAuthenticated, getProfile);
router.post('/profile', isAuthenticated, postUpdateProfile);

module.exports = router;
