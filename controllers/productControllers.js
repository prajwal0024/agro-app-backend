/* eslint-disable no-unused-vars */
const { uuid } = require('uuidv4');
const mongoose = require('mongoose');
const catchAsyncHandler = require('../helpers/catchAsyncHandler');
const AppError = require('../helpers/appError');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');

exports.uploadOtherProductImages = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. Get image from body
  const { imageStr } = req.body;
  if (!imageStr) return next(new AppError('No image found', 404));

  // 2. Upload Image
  const imageId = uuid();
  const uploadResponse = await cloudinary.uploader.upload(imageStr, {
    public_id: `AgroApp/Products/product-${imageId}`,
    overwrite: true,
  });
  if (!uploadResponse)
    return next(
      new AppError('Problem uploading image, please try again later', 500)
    );

  // 3. Update Product
  await Product.findByIdAndUpdate(id, {
    $push: { images: uploadResponse.url },
  });

  // 4. Send response
  res.status(200).json({
    status: 'success',
    data: {
      imageUrl: uploadResponse.url,
    },
  });
});

exports.deleteOtherProductImages = catchAsyncHandler(async (req, res, next) => {
  // 1. Get id from the req body
  const { id } = req.params;
  const { imagename } = req.headers;
  const extractedImageName = imagename.split('product-')[1].split('.')[0];

  // 2. Delete the image from cloudinary
  await cloudinary.uploader.destroy(
    `AgroApp/Products/product-${extractedImageName}`
  );

  // 3. Update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $pullAll: { images: [imagename] },
    },
    { new: true }
  );

  // 4. Send the response back
  res.status(204).json({
    status: 'success',
    message: 'Product Image Deleted Successfully',
  });
});

exports.uploadMainProductImage = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. Get image from body
  const { imageStr } = req.body;
  if (!imageStr) return next(new AppError('No image found', 404));

  // 2. Upload Image
  const uploadResponse = await cloudinary.uploader.upload(imageStr, {
    public_id: `AgroApp/Products/product-main-${id}`,
    overwrite: true,
  });
  if (!uploadResponse)
    return next(
      new AppError('Problem uploading image, please try again later', 500)
    );

  // 3. Update Product
  await Product.findByIdAndUpdate(id, {
    mainImage: uploadResponse.url,
  });

  // 4. Send response
  res.status(200).json({
    status: 'success',
    data: {
      imageUrl: uploadResponse.url,
    },
  });
});

exports.deleteMainImage = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // 1. Delete Image from Cloudinary
  const deletedImage = await cloudinary.uploader.destroy(
    `AgroApp/Products/product-main-${id}`
  );
  if (!deletedImage)
    return next(new AppError('Error in deleting image, try again later', 500));

  // 2. Update Product
  await Product.findByIdAndUpdate(id, { mainImage: '' });

  // 3. Send Response
  res.status(204).json({
    status: 'success',
    message: 'Main Image Deleted',
  });
});

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
  // 1. Get product information from req.body
  // 2. Save Product in DB
  // 3. Save Product to LoggedIn User
  // 4. Upload Main Image
  // 5. Upload additional images (if present)
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
    mainImage,
    images,
    state,
    block,
  } = req.body;

  const documentId = mongoose.Types.ObjectId();

  const uploadedMainImage = await cloudinary.uploader.upload(mainImage, {
    public_id: `AgroApp/Products/product-main-${documentId}`,
    overwrite: true,
  });
  if (!uploadedMainImage)
    return next(new AppError('Failed to upload image, try later', 500));

  const uploadedImages = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < images.length; i++) {
    const imageId = uuid();
    // eslint-disable-next-line no-await-in-loop
    const uploadedImage = await cloudinary.uploader.upload(images[i], {
      public_id: `AgroApp/Products/product-main-${imageId}`,
      overwrite: true,
    });

    if (uploadedImage) uploadedImages.push(uploadedImage.url);
    else
      return next(
        new AppError('Failed to upload additional image, try later', 500)
      );
  }

  const newProduct = await Product.create({
    _id: documentId,
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
    mainImage: uploadedMainImage.url,
    images: [...uploadedImages],
    block,
    state,
  });
  if (!newProduct)
    return next(
      new AppError('Error creating new product, try after sometime', 500)
    );

  req.user.products.push(newProduct._id);
  await req.user.save({ validateBeforeSave: false });

  // 6. Send Response
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

  const product = await Product.findById(id).populate('user');
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
    state,
    block,
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
      state,
      block,
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
    'email firstName lastName image'
  );

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});
