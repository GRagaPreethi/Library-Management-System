const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401).json({ success: false, message: "User no longer exists" });
    return;
  }

  req.user = user;
  next();
});

module.exports = { protect };
