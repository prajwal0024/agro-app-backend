const jwt = require('jsonwebtoken');
const AppError = require('../helpers/appError');
const User = require('../models/userModel');
const catchAsyncHandler = require('../helpers/catchAsyncHandler');

const refreshTokenDb = [];

const generateToken = (id, type) => {
  const secret =
    type === 'access' ? process.env.ACCESS_SECRET : process.env.REFRESH_SECRET;
  const expiry =
    type === 'access' ? process.env.ACCESS_EXPIRY : process.env.REFRESH_EXPIRY;

  return jwt.sign({ id }, secret, { expiresIn: expiry });
};

exports.signup = catchAsyncHandler(async (req, res, next) => {
  // 1. Save user to DB
  const { email, password, passwordConfirm } = req.body;

  if (!email || !password || !passwordConfirm)
    return next(new AppError('Insufficient Parameters', 400));

  const newUser = await User.create({ email, password, passwordConfirm });

  if (!newUser)
    return next(
      new AppError('Problem creating new user, try again later', 500)
    );

  // 2. Generate User token
  const accessToken = generateToken(newUser._id, 'access');

  // 3. Generate Refresh token
  const refreshToken = generateToken(newUser._id, 'refresh');
  refreshTokenDb.push(refreshToken);

  // 4. Set Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
  });

  // 5. Send Response
  newUser.password = undefined;
  newUser.__v = undefined;
  newUser.passwordChangedAt = undefined;
  newUser.passwordResetOTP = undefined;
  newUser.passwordResetOTPExpires = undefined;

  res.status(200).json({
    status: 'success',
    accessToken,
    data: {
      user: newUser,
    },
  });
});
