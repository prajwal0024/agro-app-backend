const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.ObjectId,
    name: {
      type: String,
      required: [true, 'Product Name is missing'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'User Id is missing'],
      ref: 'User',
    },
    mainImage: {
      type: String,
    },
    images: {
      type: [String],
    },
    price: {
      type: Number,
      required: [true, 'Product Price is missing'],
    },
    perQuantity: {
      type: String,
    },
    totalQuantity: {
      type: String,
      required: [true, 'Product total quanity is missing'],
    },
    harvestingDate: {
      type: Date,
    },
    description: {
      type: String,
      required: [true, 'Product description is missing'],
    },
    location: {
      type: Number,
      required: [true, 'Product location is missing'],
    },
    contact: {
      type: String,
    },
    block: String,
    state: String,
  },
  { timestamps: true, _id: false }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

/*
Photo
Name
Price
Per Quantity
Total Quanitity
Harvesting Date
Description
Location (Pin Code)
Contact 
Date Published
Date Last Changed
*/
