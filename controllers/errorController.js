/* eslint-disable no-console */
const AppError = require('../helpers/appError');
const customErrorHandler = require('../helpers/customErrorHandler');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error(`🔥 ERROR ${err.message}`);
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went very wrong!',
    });
  }
};

// Custom Error Handlers

// Global Error Handler
module.exports = (err, req, res, next) => {
  console.log('💥 FROM GLOBAL ERROR HANDLER 💥');
  console.log(err.code);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    const error = customErrorHandler(err);
    sendErrorProd(error, res);
  } else sendErrorProd(err, res);
};
