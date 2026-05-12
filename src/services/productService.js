const Product = require("../models/Product");

/**
 * Creates a new product securely bound to a user's ID
 */
const createProduct = async (userId, productData) => {
  try {
    const product = await Product.create({
      user: userId,
      ...productData,
    });
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves all products associated with a specific user
 */
const getProductsByUser = async (userId) => {
  try {
    const products = await Product.find({ user: userId }).sort({ createdAt: -1 });
    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single product by its database ID
 */
const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId).populate("user", "username email");
    if (!product) {
      throw { status: 404, message: "Product not found" };
    }
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves all products irrespective of the owner
 */
const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate("user", "username email");
    return products;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  getProductsByUser,
  getProductById,
  getAllProducts,
};
