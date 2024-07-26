const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  // Check for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      // console.log("decoded", decoded);
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, mes: "Invalid access token" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, mes: "Require authentication" });
  }
});

// Admin permission middleware
const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  if (+role !== 1988) {
    return res
      .status(401)
      .json({ success: false, mes: "Access denied: Admins only!" });
  }
  next(); // Call next() to pass control to the next middleware if the user is an admin
});

module.exports = {
  verifyAccessToken,
  isAdmin,
};
