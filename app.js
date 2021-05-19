const express = require('express');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const AppError = require('./helpers/appError');
const globalErrorHandler = require('./controllers/errorController');

// Initialization
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Mounting
app.use('/api/v1/users', userRouter);

// Universal route handler
app.all('*', (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on the server`))
);

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
