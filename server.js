require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
const csrfProtection = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE from forms
app.use(methodOverride('_method'));

// Session
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loopmart';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'loopmart-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    },
  })
);

// Flash messages
app.use(flash());

// CSRF protection (must be after session)
app.use(csrfProtection);

// Global template locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.sessionUser = req.session.userId
    ? { id: req.session.userId, name: req.session.userName, role: req.session.userRole }
    : null;
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  next();
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/auth', authLimiter, require('./routes/auth'));
app.use('/products', apiLimiter, require('./routes/products'));
app.use('/rentals', apiLimiter, require('./routes/rentals'));
app.use('/orders', apiLimiter, require('./routes/orders'));
app.use('/admin', apiLimiter, require('./routes/admin'));

// Cart route
const { isAuthenticated } = require('./middleware/auth');
const orderController = require('./controllers/orderController');
app.get('/cart', isAuthenticated, orderController.getCart);
app.post('/cart/add/:id', isAuthenticated, orderController.addToCart);
app.post('/cart/remove/:id', isAuthenticated, orderController.removeFromCart);

// Seller shortcut routes (redirect to /products/seller/*)
app.get('/seller/dashboard', isAuthenticated, (req, res) => res.redirect('/products/seller/dashboard'));
app.get('/seller/new-product', isAuthenticated, (req, res) => res.redirect('/products/seller/new'));

// Home route
app.get('/', apiLimiter, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const featured = await Product.find({ isApproved: true }).sort({ createdAt: -1 }).limit(8).populate('seller', 'name');
    const rentals = await Product.find({ isApproved: true, isAvailableForRent: true }).sort({ createdAt: -1 }).limit(4).populate('seller', 'name');
    res.render('home', { title: 'LoopMart - Buy, Sell & Rent', featured, rentals });
  } catch (err) {
    res.render('home', { title: 'LoopMart - Buy, Sell & Rent', featured: [], rentals: [] });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash('error', err.message || 'Something went wrong');
  res.status(500).redirect('/');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LoopMart server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
