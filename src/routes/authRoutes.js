const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validationMiddleware");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const router = express.Router();

// ──────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates an unverified user, hashes the password, generates a 6-digit OTP, and sends a verification email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, dateOfBirth, gender, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               gender:
 *                 type: string
 *                 enum: [male, female, others]
 *                 example: male
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: StrongP@ss1
 *     responses:
 *       201:
 *         description: User registered – OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       409:
 *         description: User already exists
 *       422:
 *         description: Validation error
 */
router.post(
  "/signup",

  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("dateOfBirth").isISO8601().withMessage("Please provide a valid date of birth (YYYY-MM-DD)"),
    body("gender").isIn(["male", "female", "others"]).withMessage("Gender must be male, female, or others"),
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],
  validate,
  authController.signup,
);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/verify-email
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     description: Accepts the email and OTP, marks the user as verified if the OTP is valid and not expired.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be a 6-digit code"),
  ],
  validate,
  authController.verifyEmail,
);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification-otp
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/resend-verification-otp:
 *   post:
 *     summary: Resend verification OTP
 *     description: Generates and sends a fresh 6-digit OTP to an unverified user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: New verification OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Email is already verified
 *       404:
 *         description: User not found
 */
router.post(
  "/resend-verification-otp",
  [body("email").isEmail().withMessage("Please provide a valid email address")],
  validate,
  authController.resendVerificationOtp,
);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in
 *     description: Authenticates a verified user and returns a signed JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ss1
 *     responses:
 *       200:
 *         description: Login successful – JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not yet verified
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login,
);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out
 *     description: Blacklists the current JWT so it can no longer be used.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: No token or invalid token
 */
router.post("/logout", verifyToken, authController.logout);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: Generates a new OTP, saves it to the user document, and sends it via email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: No account found with this email
 */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email address")],
  validate,
  authController.forgotPassword,
);

// ──────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Verifies the OTP and updates the user's password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewStr0ng@Pass
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be a 6-digit code"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("New password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("New password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("New password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("New password must contain at least one special character"),
  ],
  validate,
  authController.resetPassword,
);

// ──────────────────────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user details
 *     description: Returns the profile data of the currently authenticated user.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: john_doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                       example: 1990-01-01
 *                     gender:
 *                       type: string
 *                       example: male
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me", verifyToken, authController.getMe);

// ──────────────────────────────────────────────────────────────
// GET /api/auth/users
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users in the system.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/users", verifyToken, authController.getAllUsers);

// ──────────────────────────────────────────────────────────────
// DELETE /api/auth/users/:id
// ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Delete a user and their products
 *     description: Deletes a user by ID and cascades the deletion to all associated products. Requires admin privileges.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User and all associated products deleted successfully
 *       403:
 *         description: Access denied. Admin resources only.
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", verifyToken, isAdmin, authController.deleteUser);

module.exports = router;
