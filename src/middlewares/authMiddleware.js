const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isTokenBlacklisted } = require("../services/authService");

/**
 * Middleware — verifies JWT from the Authorization header.
 * Rejects blacklisted tokens.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
        data: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
  }
};

/**
 * Middleware — checks if the current user has admin privileges.
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin resources only.",
        data: null,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking admin status",
      data: null,
    });
  }
};

module.exports = { verifyToken, isAdmin };
