const catchAsyncHandler = require('../helpers/catchAsyncHandler');
const AppError = require('../helpers/appError');
const Product = require('../models/productModel');
const User = require('../models/userModel');

exports.getProductByUserId = catchAsyncHandler(async (req, res, next) => {
  const products = await User.findById(req.user.id)
    .select('products')
    .populate('products');

  res.status(200).json({
    status: 'success',
    result: products.length,
    data: {
      products: products.products,
    },
  });
});

exports.createUserProduct = catchAsyncHandler(async (req, res, next) => {
  const {
    name,
    photo,
    price,
    perQuantity,
    totalQuantity,
    harvestingDate,
    description,
    location,
    contact,
  } = req.body;

  const newProduct = await Product.create({
    user: req.user.id,
    name,
    photo,
    price,
    perQuantity,
    totalQuantity,
    harvestingDate,
    description,
    location,
    contact,
  });

  req.user.products.push(newProduct._id);
  await req.user.save({ validateBeforeSave: false });

  if (!newProduct)
    return next(
      new AppError('Error creating new product, try after sometime', 500)
    );

  res.status(200).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.getProductById = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError('No product id found', 404));

  const product = await Product.findById(id).populate('user', 'email');
  if (!product) return next(new AppError('No product found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProductById = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    photo,
    price,
    perQuantity,
    totalQuantity,
    harvestingDate,
    description,
    location,
    contact,
  } = req.body;

  if (!id) return next(new AppError('No product id found', 404));

  const product = await Product.findByIdAndUpdate(
    id,
    {
      name,
      photo,
      price,
      perQuantity,
      totalQuantity,
      harvestingDate,
      description,
      location,
      contact,
    },
    { new: true, runValidators: true }
  );
  if (!product) return next(new AppError('No product found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.getAllProducts = catchAsyncHandler(async (req, res, next) => {
  const products = await Product.find().populate(
    'user',
    'email firstName lastName'
  );

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});
