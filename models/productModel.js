const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product Name is missing'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'User Id is missing'],
      ref: 'User',
    },
    photo: {
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
  },
  { timestamps: true }
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
