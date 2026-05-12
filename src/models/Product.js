const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    imageLink: {
      type: String,
      required: [true, "Product image link is required"],
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
