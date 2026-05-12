const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const { generateOtp } = require("../utils/otpGenerator");
const { sendOtpEmail } = require("../utils/mailer");

const OTP_EXPIRY_MINUTES = 10;
 
// --------------------------------------------------------
// In-memory token blacklist (swap for Redis in production)
// --------------------------------------------------------
const tokenBlacklist = new Set();

/**
 * Register a new user, hash password, generate OTP, send verification email.
 */
const signup = async (username, dateOfBirth, gender, email, password) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { status: 409, message: "User already exists with this email" };
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const user = await User.create({
      username,
      dateOfBirth,
      gender,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    // Send email in background - don't block the response
    sendOtpEmail(email, otp, "Verify Your Agent IDE Account").catch((err) =>
      console.error("Email send failed:", err.message)
    );

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify email using the provided OTP.
 */
const verifyEmail = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (user.isVerified) {
      throw { status: 400, message: "Email is already verified" };
    }

    if (user.otp !== otp) {
      throw { status: 400, message: "Invalid OTP" };
    }

    if (user.otpExpires < new Date()) {
      throw { status: 400, message: "OTP has expired" };
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { id: user._id, email: user.email, isVerified: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate user and return a signed JWT.
 */
const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    if (!user.isVerified) {
      throw {
        status: 403,
        message: "Please verify your email before logging in",
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return { token, user: { id: user._id, email: user.email, role: user.role } };
  } catch (error) {
    throw error;
  }
};

/**
 * Blacklist a JWT so it can no longer be used.
 */
const logout = async (token) => {
  try {
    tokenBlacklist.add(token);
  } catch (error) {
    throw error;
  }
};

/**
 * Check whether a token has been blacklisted.
 */
const isTokenBlacklisted = (token) => tokenBlacklist.has(token);

/**
 * Generate and send an OTP for password reset.
 */
const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: "No account found with this email" };
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(email, otp, "Reset Your Agent IDE Password");

    return { message: "Password reset OTP sent to your email" };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP and update the password.
 */
const resetPassword = async (email, otp, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (user.otp !== otp) {
      throw { status: 400, message: "Invalid OTP" };
    }

    if (user.otpExpires < new Date()) {
      throw { status: 400, message: "OTP has expired" };
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { message: "Password has been reset successfully" };
  } catch (error) {
    throw error;
  }
};

/**
 * Resend verification OTP for unverified users.
 */
const resendVerificationOtp = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    if (user.isVerified) {
      throw { status: 400, message: "Email is already verified" };
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email in background
    sendOtpEmail(email, otp, "Your New Verification OTP").catch((err) =>
      console.error("Email send failed:", err.message),
    );

    return { message: "A new verification OTP has been sent to your email" };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user profile details by ID.
 */
const getMe = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "username email dateOfBirth gender role"
    );
    if (!user) {
      throw { status: 404, message: "User not found" };
    }
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all users.
 */
const getAllUsers = async () => {
  try {
    const users = await User.find().select("-password -otp -otpExpires");
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a user and all their associated products.
 */
const deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    // Cascade delete products
    await Product.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    return { message: "User and all associated products deleted successfully" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  isTokenBlacklisted,
  forgotPassword,
  resetPassword,
  resendVerificationOtp,
  getMe,
  getAllUsers,
  deleteUser,
};
