const authService = require("../services/authService");

/**
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { username, dateOfBirth, gender, email, password } = req.body;

    const data = await authService.signup(
      username,
      dateOfBirth,
      gender,
      email,
      password
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = await authService.verifyEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    await authService.logout(req.token);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const data = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: data.message,
      data: null,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const data = await authService.resetPassword(
      email,
      otp,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data: null,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * POST /api/auth/resend-verification-otp
 */
const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const data = await authService.resendVerificationOtp(email);

    return res.status(200).json({
      success: true,
      message: data.message,
      data: null,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const data = await authService.getMe(userId);

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * GET /api/auth/users
 */
const getAllUsers = async (req, res) => {
  try {
    const data = await authService.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

/**
 * DELETE /api/auth/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await authService.deleteUser(id);

    return res.status(200).json({
      success: true,
      message: data.message,
      data: null,
    });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  resendVerificationOtp,
  getMe,
  getAllUsers,
  deleteUser,
};
