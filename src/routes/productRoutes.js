const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validationMiddleware");
const { verifyToken } = require("../middlewares/authMiddleware");
const productController = require("../controllers/productController");

const router = express.Router();

// -- POST /api/products ---------------------------------------

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     description: Creates a new product bound to the authenticated user.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, imageLink, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro
 *               description:
 *                 type: string
 *                 example: Latest Apple smartphone.
 *               price:
 *                 type: number
 *                 description: Price in rupees
 *                 example: 129900
 *               imageLink:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5
 *               category:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post(
  "/",
  verifyToken, // Guarantees user is logged in
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description").trim().notEmpty().withMessage("Product description is required"),
    body("price")
      .isNumeric()
      .withMessage("Price must be a valid number")
      .custom((value) => value >= 0)
      .withMessage("Price cannot be negative"),
    body("imageLink")
      .isURL()
      .withMessage("Please provide a valid image URL")
      .custom((value) => value.includes("unsplash.com"))
      .withMessage("Image link must be an unsplash.com URL"),
    body("category").trim().notEmpty().withMessage("Product category is required"),
  ],
  validate,
  productController.createProduct
);

// -- GET /api/products ----------------------------------------

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves all products.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", productController.getAllProducts);

// -- GET /api/products/mine -----------------------------------

/**
 * @swagger
 * /api/products/mine:
 *   get:
 *     summary: Get my products
 *     description: Retrieves all products created by the currently authenticated user.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/mine", verifyToken, productController.getMyProducts);

// -- GET /api/products/:id ------------------------------------

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieves the details of a single product using its database ID.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found
 */
const { param } = require("express-validator");
router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid product ID format"),
  ],
  validate,
  productController.getProductById
);

module.exports = router;
