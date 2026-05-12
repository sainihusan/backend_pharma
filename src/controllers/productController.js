const productService = require("../services/productService");

/**
 * POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, price, imageLink, category } = req.body;

    const data = await productService.createProduct(userId, {
      name,
      description,
      price,
      imageLink,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
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
 * GET /api/products/mine
 */
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = await productService.getProductsByUser(userId);

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
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
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
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
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const data = await productService.getAllProducts();

    return res.status(200).json({
      success: true,
      message: "All products retrieved successfully",
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

module.exports = {
  createProduct,
  getMyProducts,
  getProductById,
  getAllProducts,
};
