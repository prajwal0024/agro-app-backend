const AppError = require('../helpers/appError');
const catchAsyncHandler = require('../helpers/catchAsyncHandler');
const User = require('../models/userModel');

exports.getMe = (req, res, next) => {
  req.query.id = req.user.id;
  next();
};

exports.getUserById = catchAsyncHandler(async (req, res, next) => {
  // 1. Get Id from query
  const { id } = req.query;

  // 2. Get the user
  const user = await User.findById(id);

  if (!user) return next(new AppError(`No user found by id: ${id}`, 404));

  // 3. Return the user
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
