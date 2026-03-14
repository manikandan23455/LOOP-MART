const Order = require('../models/Order');
const Product = require('../models/Product');

const getCart = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('orders/cart', { title: 'Shopping Cart', cart, total });
};

const addToCart = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isApproved: true,
      isAvailableForSale: true,
    });
    if (!product) {
      req.flash('error', 'Product not available');
      return res.redirect('/products');
    }
    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;
    const existing = cart.find((i) => i.productId === product._id.toString());
    const qty = parseInt(req.body.quantity, 10) || 1;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.push({
        productId: product._id.toString(),
        title: product.title,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
        quantity: qty,
      });
    }
    req.flash('success', 'Added to cart');
    res.redirect('/cart');
  } catch (err) {
    req.flash('error', 'Failed to add to cart');
    res.redirect('/products');
  }
};

const removeFromCart = (req, res) => {
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter((i) => i.productId !== req.params.id);
  }
  req.flash('success', 'Item removed from cart');
  res.redirect('/cart');
};

const getCheckout = (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) {
    req.flash('error', 'Your cart is empty');
    return res.redirect('/cart');
  }
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.render('orders/checkout', { title: 'Checkout', cart, total });
};

const postCheckout = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }
    const { shippingAddress, paymentMethod } = req.body;
    const items = [];
    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        req.flash('error', `Insufficient stock for ${item.title}`);
        return res.redirect('/cart');
      }
      items.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
      product.stock -= item.quantity;
      await product.save();
    }
    const totalAmount = items.reduce((s, i) => s + i.priceAtPurchase * i.quantity, 0);
    await Order.create({
      buyer: req.session.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });
    req.session.cart = [];
    req.flash('success', 'Order placed successfully!');
    res.redirect('/orders');
  } catch (err) {
    req.flash('error', err.message || 'Checkout failed');
    res.redirect('/cart');
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'title images');
    res.render('orders/my-orders', { title: 'My Orders', orders });
  } catch (err) {
    req.flash('error', 'Failed to load orders');
    res.redirect('/');
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.session.userId }).populate(
      'items.product',
      'title images price'
    );
    if (!order) {
      req.flash('error', 'Order not found');
      return res.redirect('/orders');
    }
    res.render('orders/detail', { title: `Order #${order._id}`, order });
  } catch (err) {
    req.flash('error', 'Failed to load order');
    res.redirect('/orders');
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  getCheckout,
  postCheckout,
  getMyOrders,
  getOrderDetail,
};
