const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is missing'],
    unique: [true, 'Email should be unique'],
    lower: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Email is invalid',
    ],
  },
  roles: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is missing'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password is missing'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password and Confirm Password do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetOTP: String,
  passwordResetOTPExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (passwordFromReq) {
  return bcrypt.compare(passwordFromReq, this.password);
};

userSchema.methods.isPasswordChangedAfterJWT = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTime;
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  // 1. Generate Password Reset OTP
  const passwordResetOTP = Math.floor(100000 + Math.random() * 899999);

  // 2. Encrypt the OTP
  this.passwordResetOTP = crypto
    .createHash('sha256')
    .update(passwordResetOTP.toString())
    .digest('hex');

  // 3. Set OTP Expiry
  this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

  return passwordResetOTP;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
