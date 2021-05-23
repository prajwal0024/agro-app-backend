const AppError = require('../helpers/appError');
const catchAsyncHandler = require('../helpers/catchAsyncHandler');
const User = require('../models/userModel');

exports.getMe = (req, res, next) => {
  req.query.id = req.user.id;
  next();
};

const filterObjects = (obj, ...allowedFiles) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFiles.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
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

exports.updateMe = catchAsyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This is not the route for updating the password', 403)
    );

  const filteredObjects = filterObjects(
    req.body,
    'firstName',
    'lastName',
    'phone',
    'areaCode',
    'farmSize'
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredObjects,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.updateUserPassword = catchAsyncHandler(async (req, res, next) => {
  // 1. Get passwords from req
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!passwordCurrent || !password || !passwordConfirm)
    return next(new AppError('Insufficient Parameters', 403));

  // 2. Check if current password is correct
  const user = await User.findById(req.user.id).select('+password -__v');
  if (!(await user.checkPassword(passwordCurrent)))
    return next(new AppError('Invalid current password', 403));

  // 3. Set new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4. Return response
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});
