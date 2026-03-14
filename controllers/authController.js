const User = require('../models/User');

const getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

const postRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }
    const allowedRoles = ['buyer', 'seller'];
    const userRole = allowedRoles.includes(role) ? role : 'buyer';
    await User.create({ name, email, password, role: userRole });
    req.flash('success', 'Account created! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    req.flash('error', err.message || 'Registration failed');
    res.redirect('/auth/register');
  }
};

const getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated');
      return res.redirect('/auth/login');
    }
    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    req.session.userRole = user.role;
    req.flash('success', `Welcome back, ${user.name}!`);
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    if (user.role === 'seller') return res.redirect('/seller/dashboard');
    res.redirect('/products');
  } catch (err) {
    req.flash('error', 'Login failed');
    res.redirect('/auth/login');
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('user/profile', { title: 'My Profile', user });
  } catch (err) {
    req.flash('error', 'Unable to load profile');
    res.redirect('/');
  }
};

const postUpdateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { name, phone, address });
    req.session.userName = name;
    req.flash('success', 'Profile updated successfully');
    res.redirect('/auth/profile');
  } catch (err) {
    req.flash('error', 'Failed to update profile');
    res.redirect('/auth/profile');
  }
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  getProfile,
  postUpdateProfile,
};
