const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Rental = require('../models/Rental');

const getDashboard = async (req, res) => {
  try {
    const [users, products, orders, rentals] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Rental.countDocuments(),
    ]);
    const pendingProducts = await Product.countDocuments({ isApproved: false });
    const activeRentals = await Rental.countDocuments({ status: 'Active' });
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { users, products, orders, rentals, pendingProducts, activeRentals },
    });
  } catch (err) {
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (err) {
    req.flash('error', 'Failed to load users');
    res.redirect('/admin/dashboard');
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    if (user.role === 'admin') {
      req.flash('error', 'Cannot deactivate admin');
      return res.redirect('/admin/users');
    }
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `User ${user.isActive ? 'activated' : 'deactivated'}`);
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Failed to update user');
    res.redirect('/admin/users');
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');
    res.render('admin/products', { title: 'Manage Products', products });
  } catch (err) {
    req.flash('error', 'Failed to load products');
    res.redirect('/admin/dashboard');
  }
};

const approveProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isApproved: true });
    req.flash('success', 'Product approved');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Failed to approve product');
    res.redirect('/admin/products');
  }
};

const rejectProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product rejected and removed');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Failed to reject product');
    res.redirect('/admin/products');
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('buyer', 'name email')
      .populate('items.product', 'title');
    res.render('admin/orders', { title: 'Manage Orders', orders });
  } catch (err) {
    req.flash('error', 'Failed to load orders');
    res.redirect('/admin/dashboard');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { orderStatus: status });
    req.flash('success', 'Order status updated');
    res.redirect('/admin/orders');
  } catch (err) {
    req.flash('error', 'Failed to update order');
    res.redirect('/admin/orders');
  }
};

const getRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .sort({ createdAt: -1 })
      .populate('product', 'title')
      .populate('renter', 'name email')
      .populate('owner', 'name');
    res.render('admin/rentals', { title: 'Manage Rentals', rentals });
  } catch (err) {
    req.flash('error', 'Failed to load rentals');
    res.redirect('/admin/dashboard');
  }
};

const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      req.flash('error', 'Rental not found');
      return res.redirect('/admin/rentals');
    }
    rental.status = status;
    if (status === 'Returned') rental.depositRefunded = true;
    await rental.save();
    req.flash('success', 'Rental status updated');
    res.redirect('/admin/rentals');
  } catch (err) {
    req.flash('error', 'Failed to update rental');
    res.redirect('/admin/rentals');
  }
};

module.exports = {
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
};
