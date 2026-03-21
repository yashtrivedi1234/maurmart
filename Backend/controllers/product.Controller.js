import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../utils/socketManager.js";
import { normalizeWhitespace } from "../utils/validation.js";

/* ----------------------------- HELPER FUNCTIONS ----------------------------- */

const toBoolean = (value) => value === "true" || value === true;
const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return JSON.parse(value);
};
const ensurePositiveNumber = (value, field) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a valid non-negative number`);
  }
  return parsed;
};

/* ----------------------------- GET ALL PRODUCTS ----------------------------- */
export const getProducts = async (req, res) => {
  try {
    const {
      stockStatus,
      minStock,
      maxStock,
      sortByStock,
      category,
      minPrice,
      maxPrice,
      sortByPrice,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by stock status
    if (stockStatus) {
      if (stockStatus === "inStock") {
        filter.stock = { $gt: 10 };
      } else if (stockStatus === "lowStock") {
        filter.stock = { $gte: 1, $lte: 10 };
      } else if (stockStatus === "outOfStock") {
        filter.stock = { $eq: 0 };
      }
    }

    // Filter by stock range
    if (minStock || maxStock) {
      filter.stock = { ...filter.stock };
      if (minStock) filter.stock.$gte = parseInt(minStock);
      if (maxStock) filter.stock.$lte = parseInt(maxStock);
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Filter by search term (name and description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};

    if (sortByStock) {
      sort.stock = sortByStock === "asc" ? 1 : -1;
    } else if (sortByPrice) {
      sort.price = sortByPrice === "asc" ? 1 : -1;
    } else {
      // Default sort by newest
      sort.createdAt = -1;
    }

    // Execute query with filtering and sorting
    const products = await Product.find(filter)
      .sort(sort)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ----------------------------- GET PRODUCT BY ID ---------------------------- */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ---------------------------- FEATURED PRODUCTS ---------------------------- */
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8).lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ---------------------------- NEW ARRIVALS ---------------------------- */
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ---------------------------- TRENDING PRODUCTS ---------------------------- */
export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* --------------------------- UPDATE PRODUCT STATUS -------------------------- */
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, isNewArrival, isTrending } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const updateData = {};
    if (isFeatured !== undefined) updateData.isFeatured = toBoolean(isFeatured);
    if (isNewArrival !== undefined) updateData.isNewArrival = toBoolean(isNewArrival);
    if (isTrending !== undefined) updateData.isTrending = toBoolean(isTrending);

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 📡 Broadcast product status changed event
    const io = getIO();
    io.emit("productStatusChanged", {
      product: updatedProduct,
      message: `Product status updated: ${updatedProduct.name}`,
      isFeatured: updatedProduct.isFeatured,
      isNewArrival: updatedProduct.isNewArrival,
      isTrending: updatedProduct.isTrending,
      timestamp: new Date(),
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({

      error: error.message,
    });
  }
};

/* ------------------------------ CREATE PRODUCT ------------------------------ */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      category,
      rating,
      numReviews,
      stock,
      isFeatured,
      isNewArrival,
      isTrending,
      highlights,
      specifications,
      questions,
      bankOffers,
      inTheBox,
    } = req.body;

    const normalizedName = normalizeWhitespace(name);
    const normalizedCategory = normalizeWhitespace(category);
    const normalizedDescription = normalizeWhitespace(description || "");

    if (!normalizedName || price === undefined || price === "" || !normalizedCategory) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    const parsedPrice = ensurePositiveNumber(price, "Price");
    const parsedOriginalPrice = originalPrice ? ensurePositiveNumber(originalPrice, "Original price") : 0;
    const parsedRating = rating ? ensurePositiveNumber(rating, "Rating") : 0;
    const parsedNumReviews = numReviews ? ensurePositiveNumber(numReviews, "Review count") : 0;
    const parsedStock = stock ? ensurePositiveNumber(stock, "Stock") : 0;

    if (parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 0 and 5" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Product image upload is required",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "products");

    if (!result?.url || !result?.public_id) {
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary",
      });
    }

    const product = new Product({
      name: normalizedName,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      description: normalizedDescription,
      category: normalizedCategory,
      image: result.url,
      image_public_id: result.public_id,
      rating: parsedRating,
      numReviews: parsedNumReviews,
      stock: parsedStock,
      isFeatured: toBoolean(isFeatured),
      isNewArrival: toBoolean(isNewArrival),
      isTrending: toBoolean(isTrending),
      highlights: parseJsonField(highlights, []),
      specifications: parseJsonField(specifications, []),
      questions: parseJsonField(questions, []),
      bankOffers: parseJsonField(bankOffers, []),
      inTheBox: parseJsonField(inTheBox, []),
    });

    const createdProduct = await product.save();

    // 📡 Broadcast product created event
    const io = getIO();
    io.emit("productCreated", {
      product: createdProduct,
      message: `New product: ${createdProduct.name}`,
      timestamp: new Date(),
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ------------------------------ UPDATE PRODUCT ------------------------------ */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* -------- IMAGE UPDATE -------- */

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "products");

      if (!result?.url || !result?.public_id) {
        return res.status(500).json({
          message: "Failed to upload image",
        });
      }

      if (product.image_public_id) {
        await deleteFromCloudinary(product.image_public_id);
      }

      product.image = result.url;
      product.image_public_id = result.public_id;
    }

    /* -------- UPDATE FIELDS -------- */

    if (req.body.name !== undefined) product.name = normalizeWhitespace(req.body.name);
    if (req.body.description !== undefined) product.description = normalizeWhitespace(req.body.description);
    if (req.body.category !== undefined) product.category = normalizeWhitespace(req.body.category);

    if (req.body.price !== undefined)
      product.price = ensurePositiveNumber(req.body.price, "Price");

    if (req.body.originalPrice !== undefined)
      product.originalPrice = ensurePositiveNumber(req.body.originalPrice, "Original price");

    if (req.body.stock !== undefined) product.stock = ensurePositiveNumber(req.body.stock, "Stock");

    if (req.body.rating !== undefined)
      product.rating = ensurePositiveNumber(req.body.rating, "Rating");

    if (req.body.numReviews !== undefined)
      product.numReviews = ensurePositiveNumber(req.body.numReviews, "Review count");

    if (req.body.isFeatured !== undefined)
      product.isFeatured = toBoolean(req.body.isFeatured);

    if (req.body.isNewArrival !== undefined)
      product.isNewArrival = toBoolean(req.body.isNewArrival);

    if (req.body.isTrending !== undefined)
      product.isTrending = toBoolean(req.body.isTrending);

    if (req.body.highlights !== undefined)
      product.highlights = parseJsonField(req.body.highlights, []);

    if (req.body.specifications !== undefined)
      product.specifications = parseJsonField(req.body.specifications, []);

    if (req.body.questions !== undefined)
      product.questions = parseJsonField(req.body.questions, []);
    
    if (req.body.bankOffers !== undefined)
      product.bankOffers = parseJsonField(req.body.bankOffers, []);
    
    if (req.body.inTheBox !== undefined)
      product.inTheBox = parseJsonField(req.body.inTheBox, []);

    if (!product.name || !product.category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    if (product.rating > 5) {
      return res.status(400).json({ message: "Rating must be between 0 and 5" });
    }

    const updatedProduct = await product.save();

    // 📡 Broadcast product updated event
    const io = getIO();
    io.emit("productUpdated", {
      product: updatedProduct,
      message: `Product updated: ${updatedProduct.name}`,
      timestamp: new Date(),
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ------------------------------ DELETE PRODUCT ------------------------------ */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image_public_id) {
      await deleteFromCloudinary(product.image_public_id);
    }

    // 📡 Broadcast product deleted event
    const io = getIO();
    io.emit("productDeleted", {
      productId: product._id,
      productName: product.name,
      message: `Product deleted: ${product.name}`,
      timestamp: new Date(),
    });

    res.status(200).json({
      message: "Product removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/* ----------------------------- CHECK IF USER CAN REVIEW ----------------------------- */
export const canUserReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": productId,
      paymentStatus: "Paid",
    });

    res.status(200).json({ canReview: !!hasPurchased });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ----------------------------- ADD PRODUCT REVIEW ----------------------------- */
export const addProductReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // 1. Check if user already reviewed
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // 2. Check if user purchased this product
    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": productId,
      paymentStatus: "Paid",
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Only verified buyers can review products" });
    }

    // 3. Get user details to get the name
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4. Add review
    const review = {
      name: user.name,
      rating: Number(rating),
      comment,
      user: userId,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
