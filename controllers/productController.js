const Product = require('../models/Product');
const User = require('../models/User');

const getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, rent } = req.query;
    const filter = { isApproved: true, isAvailableForSale: true };
    if (rent === 'true') {
      filter.isAvailableForRent = true;
      delete filter.isAvailableForSale;
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(filter).sort(sortOption).populate('seller', 'name');
    const categories = Product.schema.path('category').enumValues;
    res.render('products/index', {
      title: 'Browse Products',
      products,
      categories,
      query: req.query,
    });
  } catch (err) {
    req.flash('error', 'Failed to load products');
    res.redirect('/');
  }
};

const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email phone');
    if (!product || !product.isApproved) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }
    res.render('products/detail', { title: product.title, product });
  } catch (err) {
    req.flash('error', 'Failed to load product');
    res.redirect('/products');
  }
};

const getSellerDashboard = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.session.userId }).sort({ createdAt: -1 });
    res.render('products/seller-dashboard', { title: 'Seller Dashboard', products });
  } catch (err) {
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/');
  }
};

const getNewProduct = (req, res) => {
  const categories = Product.schema.path('category').enumValues;
  res.render('products/new', { title: 'List New Product', categories });
};

const postNewProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      stock,
      condition,
      isAvailableForRent,
      rentalPricePerDay,
      securityDeposit,
      isAvailableForSale,
      tags,
    } = req.body;
    const images = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];
    await Product.create({
      title,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      condition,
      isAvailableForRent: isAvailableForRent === 'on',
      rentalPricePerDay: parseFloat(rentalPricePerDay) || 0,
      securityDeposit: parseFloat(securityDeposit) || 0,
      isAvailableForSale: isAvailableForSale !== 'off',
      seller: req.session.userId,
      images,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    req.flash('success', 'Product listed! Awaiting admin approval.');
    res.redirect('/seller/dashboard');
  } catch (err) {
    req.flash('error', err.message || 'Failed to list product');
    res.redirect('/seller/new-product');
  }
};

const getEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.userId });
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/seller/dashboard');
    }
    const categories = Product.schema.path('category').enumValues;
    res.render('products/edit', { title: 'Edit Product', product, categories });
  } catch (err) {
    req.flash('error', 'Failed to load product');
    res.redirect('/seller/dashboard');
  }
};

const putEditProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      stock,
      condition,
      isAvailableForRent,
      rentalPricePerDay,
      securityDeposit,
      isAvailableForSale,
      tags,
    } = req.body;
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.userId });
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/seller/dashboard');
    }
    const newImages = req.files ? req.files.map((f) => `/uploads/products/${f.filename}`) : [];
    product.title = title;
    product.description = description;
    product.category = category;
    product.price = parseFloat(price);
    product.stock = parseInt(stock, 10);
    product.condition = condition;
    product.isAvailableForRent = isAvailableForRent === 'on';
    product.rentalPricePerDay = parseFloat(rentalPricePerDay) || 0;
    product.securityDeposit = parseFloat(securityDeposit) || 0;
    product.isAvailableForSale = isAvailableForSale !== 'off';
    product.tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (newImages.length > 0) product.images = newImages;
    product.isApproved = false;
    await product.save();
    req.flash('success', 'Product updated! Awaiting re-approval.');
    res.redirect('/seller/dashboard');
  } catch (err) {
    req.flash('error', 'Failed to update product');
    res.redirect('/seller/dashboard');
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, seller: req.session.userId });
    req.flash('success', 'Product deleted');
    res.redirect('/seller/dashboard');
  } catch (err) {
    req.flash('error', 'Failed to delete product');
    res.redirect('/seller/dashboard');
  }
};

module.exports = {
  getAllProducts,
  getProductDetail,
  getSellerDashboard,
  getNewProduct,
  postNewProduct,
  getEditProduct,
  putEditProduct,
  deleteProduct,
};
