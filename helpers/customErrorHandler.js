const AppError = require('./appError');

module.exports = (error) => {
  if (error.code === 11000 && Object.keys(error.keyValue)[0] === 'email') {
    return new AppError(`Account with this email, already exsists`, 400);
  }
  return error;
};
