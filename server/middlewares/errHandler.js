const { model } = require("mongoose");

const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} Not Found!`);
  res.status(404);
  next(error);
};

const errHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
  });
};

module.exports = {
  notFound,
  errHandler,
};
