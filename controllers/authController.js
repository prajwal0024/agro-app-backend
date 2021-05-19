const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../helpers/appError');
const User = require('../models/userModel');
const catchAsyncHandler = require('../helpers/catchAsyncHandler');

let refreshTokenDb = [];

const generateToken = (id, type) => {
  const secret =
    type === 'access' ? process.env.ACCESS_SECRET : process.env.REFRESH_SECRET;
  const expiry =
    type === 'access' ? process.env.ACCESS_EXPIRY : process.env.REFRESH_EXPIRY;

  return jwt.sign({ id }, secret, { expiresIn: expiry });
};

exports.signup = catchAsyncHandler(async (req, res, next) => {
  // 1. Get email and password from req
  const { email, password, passwordConfirm } = req.body;

  if (!email || !password || !passwordConfirm)
    return next(new AppError('Insufficient Parameters', 400));

  // 2. Save user to DB
  const newUser = await User.create({ email, password, passwordConfirm });

  if (!newUser)
    return next(
      new AppError('Problem creating new user, try again later', 500)
    );

  // 3. Generate access, refresh tokens
  const accessToken = generateToken(newUser._id, 'access');

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

exports.login = catchAsyncHandler(async (req, res, next) => {
  // 1. Get email id from req
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Insufficient Parameters', 400));

  // 2. Check if user exsists
  const user = await User.findOne({ email }).select('+password -__v');
  if (!user) return next(new AppError('Invalid email or password', 403));

  // 3. Check is password is correct
  if (!(await user.checkPassword(password)))
    return next(new AppError('Invalid email or password', 403));

  // 4. Generate user, refresh tokens
  const accessToken = generateToken(user._id, 'access');

  const refreshToken = generateToken(user._id, 'refresh');
  refreshTokenDb.push(refreshToken);

  // 5. Set Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
  });

  // 6. Send Response
  user.password = undefined;
  user.__v = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;

  res.status(200).json({
    status: 'success',
    accessToken,
    data: {
      user,
    },
  });
});

exports.protect = catchAsyncHandler(async (req, res, next) => {
  // 1. Get token from the users
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer'))
    token = authHeader.split(' ')[1];

  if (!token)
    return next(new AppError('No access token found, login again', 404));

  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_SECRET);

  // 3. Check if user still exsists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new AppError(
        'Token belonging to the user, no longer exsists. Login again',
        404
      )
    );

  // 4. Check if user recently changed the password
  if (freshUser.isPasswordChangedAfterJWT(decoded.iat)) {
    return next(
      new AppError('User recently changed his password, Login Again', 403)
    );
  }

  // 5. Save user on req, grant access
  req.user = freshUser;
  next();
});

exports.renewAccessToken = catchAsyncHandler(async (req, res, next) => {
  // 1. Get refresh token from cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return next(new AppError('No refresh token found, Login Again', 404));

  // 2. Check if request token exsists in DB
  if (!refreshTokenDb.includes(refreshToken))
    return next(new AppError('Invalid refresh token, Login Again', 403));

  // 3. Verify the token
  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_SECRET
  );

  // 4. Generate new access token
  const accessToken = generateToken(decoded.id, 'access');

  // 5. Return response
  res.status(200).json({
    status: 'success',
    accessToken,
  });
});

exports.revokeToken = catchAsyncHandler(async (req, res, next) => {
  // 1. Get refresh token from cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken)
    return next(new AppError('No refresh token found, Login again', 404));

  // 2. Delete token from DB
  refreshTokenDb = refreshTokenDb.filter((token) => token !== refreshToken);

  // 3. Clear the cookie
  res.cookie('refreshToken', null, {
    httpOnly: true,
  });

  // 4. Return response
  res.status(204).json({
    status: 'success',
  });
});
