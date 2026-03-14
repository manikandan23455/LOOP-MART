const Rental = require('../models/Rental');
const Product = require('../models/Product');

const getRentalProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isApproved: true, isAvailableForRent: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const products = await Product.find(filter).populate('seller', 'name');
    const categories = Product.schema.path('category').enumValues;
    res.render('rentals/index', {
      title: 'Rent Products',
      products,
      categories,
      query: req.query,
    });
  } catch (err) {
    req.flash('error', 'Failed to load rentals');
    res.redirect('/');
  }
};

const getRentForm = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isApproved: true,
      isAvailableForRent: true,
    }).populate('seller', 'name');
    if (!product) {
      req.flash('error', 'Product not available for rent');
      return res.redirect('/rentals');
    }
    res.render('rentals/rent-form', { title: `Rent: ${product.title}`, product });
  } catch (err) {
    req.flash('error', 'Failed to load rental form');
    res.redirect('/rentals');
  }
};

const postRent = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isApproved: true,
      isAvailableForRent: true,
    });
    if (!product) {
      req.flash('error', 'Product not available for rent');
      return res.redirect('/rentals');
    }
    const { startDate, endDate, shippingAddress, paymentMethod } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      req.flash('error', 'End date must be after start date');
      return res.redirect(`/rentals/rent/${req.params.id}`);
    }
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalRentalCost = rentalDays * product.rentalPricePerDay;
    const totalAmount = totalRentalCost + product.securityDeposit;
    await Rental.create({
      product: product._id,
      renter: req.session.userId,
      owner: product.seller,
      startDate: start,
      endDate: end,
      rentalDays,
      pricePerDay: product.rentalPricePerDay,
      securityDeposit: product.securityDeposit,
      totalRentalCost,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });
    req.flash('success', 'Rental request placed successfully!');
    res.redirect('/rentals/my-rentals');
  } catch (err) {
    req.flash('error', err.message || 'Rental request failed');
    res.redirect('/rentals');
  }
};

const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.session.userId })
      .sort({ createdAt: -1 })
      .populate('product', 'title images')
      .populate('owner', 'name');
    res.render('rentals/my-rentals', { title: 'My Rentals', rentals });
  } catch (err) {
    req.flash('error', 'Failed to load rentals');
    res.redirect('/');
  }
};

const getRentalDetail = async (req, res) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, renter: req.session.userId })
      .populate('product', 'title images description')
      .populate('owner', 'name email phone');
    if (!rental) {
      req.flash('error', 'Rental not found');
      return res.redirect('/rentals/my-rentals');
    }
    res.render('rentals/detail', { title: 'Rental Details', rental });
  } catch (err) {
    req.flash('error', 'Failed to load rental');
    res.redirect('/rentals/my-rentals');
  }
};

const returnRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, renter: req.session.userId });
    if (!rental || rental.status !== 'Active') {
      req.flash('error', 'Cannot return this rental');
      return res.redirect('/rentals/my-rentals');
    }
    rental.status = 'Returned';
    rental.depositRefunded = true;
    await rental.save();
    req.flash('success', 'Rental returned. Security deposit will be refunded.');
    res.redirect('/rentals/my-rentals');
  } catch (err) {
    req.flash('error', 'Failed to return rental');
    res.redirect('/rentals/my-rentals');
  }
};

module.exports = {
  getRentalProducts,
  getRentForm,
  postRent,
  getMyRentals,
  getRentalDetail,
  returnRental,
};
