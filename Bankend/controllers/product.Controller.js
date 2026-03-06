import { Product } from "../models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured products", error: error.message });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch new arrivals", error: error.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trending products", error: error.message });
  }
};

// @desc    Update product status (flags)
// @route   PATCH /api/products/admin/:id/status
// @access  Private/Admin
export const updateProductStatus = async (req, res) => {
  try {
    const { isFeatured, isNewArrival, isTrending } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (isNewArrival !== undefined) product.isNewArrival = isNewArrival;
      if (isTrending !== undefined) product.isTrending = isTrending;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
