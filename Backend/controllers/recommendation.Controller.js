import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

// @desc    Get similar products (same category or similar price)
// @route   GET /api/recommendations/similar/:productId
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    // Get the current product
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find similar products: same category, different product, based on price range
    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
      price: {
        $gte: currentProduct.price * 0.7, // 70% of current price
        $lte: currentProduct.price * 1.3, // 130% of current price
      },
    })
      .limit(parseInt(limit))
      .select("name price originalPrice image isFeatured rating");

    res.json({
      type: "similar",
      count: similarProducts.length,
      products: similarProducts,
    });
  } catch (err) {
    console.error("Get Similar Products Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get frequently bought together products
// @route   GET /api/recommendations/frequently-bought/:productId
// @access  Public
export const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    // Find orders containing this product
    const ordersWithProduct = await Order.find({
      "items.product": productId,
    }).select("items.product");

    if (ordersWithProduct.length === 0) {
      return res.json({
        type: "frequently-bought",
        count: 0,
        products: [],
      });
    }

    // Extract all product IDs from those orders
    const productFrequency = {};
    ordersWithProduct.forEach((order) => {
      order.items.forEach((item) => {
        const itemId = item.product.toString();
        if (itemId !== productId) {
          productFrequency[itemId] = (productFrequency[itemId] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top products
    const topProductIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([id]) => id);

    const frequentlyBought = await Product.find({
      _id: { $in: topProductIds },
    }).select("name price originalPrice image isFeatured rating");

    res.json({
      type: "frequently-bought",
      count: frequentlyBought.length,
      products: frequentlyBought,
    });
  } catch (err) {
    console.error("Get Frequently Bought Together Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get products from same category (new arrivals)
// @route   GET /api/recommendations/category/:productId
// @access  Public
export const getCategoryProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    // Get current product category
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find other products from same category, prioritize new arrivals
    const categoryProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
    })
      .sort({ createdAt: -1, isFeatured: -1 })
      .limit(parseInt(limit))
      .select("name price originalPrice image isFeatured isNewArrival rating");

    res.json({
      type: "category",
      category: currentProduct.category,
      count: categoryProducts.length,
      products: categoryProducts,
    });
  } catch (err) {
    console.error("Get Category Products Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get trending products (best sellers, most rated)
// @route   GET /api/recommendations/trending
// @access  Public
export const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get products with isTrending flag or high ratings
    const trendingProducts = await Product.find({
      $or: [
        { isTrending: true },
        { rating: { $gte: 4 } },
      ],
    })
      .sort({ rating: -1, reviews: -1 })
      .limit(parseInt(limit))
      .select("name price originalPrice image isTrending rating reviews");

    res.json({
      type: "trending",
      count: trendingProducts.length,
      products: trendingProducts,
    });
  } catch (err) {
    console.error("Get Trending Products Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get personalized recommendations for user (based on order history)
// @route   GET /api/recommendations/personalized
// @access  Private
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { limit = 8 } = req.query;

    // Get user's purchase history
    const userOrders = await Order.find({ user: userId }).select("items.product");

    // Get categories user has purchased from
    let purchasedProductIds = [];
    let purchasedCategories = [];

    if (userOrders.length > 0) {
      userOrders.forEach((order) => {
        order.items.forEach((item) => {
          purchasedProductIds.push(item.product);
        });
      });

      // Get categories of purchased products
      const purchasedProducts = await Product.find({
        _id: { $in: purchasedProductIds },
      }).select("category");

      purchasedCategories = [
        ...new Set(purchasedProducts.map((p) => p.category)),
      ];
    }

    // Recommend based on categories user likes
    let recommendations;
    if (purchasedCategories.length > 0) {
      recommendations = await Product.find({
        _id: { $nin: purchasedProductIds },
        category: { $in: purchasedCategories },
      })
        .sort({ rating: -1, isFeatured: -1 })
        .limit(parseInt(limit))
        .select("name price originalPrice image category rating");
    } else {
      // If no purchase history, recommend trending products
      recommendations = await Product.find({})
        .sort({ rating: -1, isTrending: -1 })
        .limit(parseInt(limit))
        .select("name price originalPrice image category rating");
    }

    res.json({
      type: "personalized",
      purchasedCategories,
      count: recommendations.length,
      products: recommendations,
    });
  } catch (err) {
    console.error("Get Personalized Recommendations Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get combo deals (products often bought together at discount)
// @route   GET /api/recommendations/combo-deals/:productId
// @access  Public
export const getComboDeal = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 3 } = req.query;

    // Get frequently bought together products
    const ordersWithProduct = await Order.find({
      "items.product": productId,
    }).select("items");

    const productFrequency = {};
    ordersWithProduct.forEach((order) => {
      order.items.forEach((item) => {
        const itemId = item.product.toString();
        if (itemId !== productId) {
          productFrequency[itemId] = (productFrequency[itemId] || 0) + 1;
        }
      });
    });

    // Get top frequently bought products (combo deal candidates)
    const comboProductIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([id]) => id);

    const comboProducts = await Product.find({
      _id: { $in: comboProductIds },
    }).select("name price originalPrice image");

    // Get main product for comparison
    const mainProduct = await Product.findById(productId).select(
      "name price"
    );

    // Calculate combo discount (15-20% off)
    const mainPrice = mainProduct.price;
    const comboPrice = comboProducts.reduce((sum, p) => sum + p.price, 0);
    const totalComboPrice = mainPrice + comboPrice;
    const discountPercentage = 15; // 15% discount on combo
    const discountedPrice = totalComboPrice * (1 - discountPercentage / 100);

    res.json({
      type: "combo-deal",
      mainProduct: mainProduct.name,
      comboProducts,
      originalPrice: totalComboPrice,
      discountedPrice,
      discountPercentage,
      savings: (totalComboPrice - discountedPrice).toFixed(2),
    });
  } catch (err) {
    console.error("Get Combo Deal Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get recommendation summary for product details page
// @route   GET /api/recommendations/summary/:productId
// @access  Public
export const getRecommendationSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get all recommendation types
    const [similar, frequentlyBought, category, combo] = await Promise.all([
      Product.find({
        _id: { $ne: productId },
        category: (
          await Product.findById(productId).select("category")
        ).category,
      })
        .limit(4)
        .select("name price image rating"),

      (async () => {
        const orders = await Order.find({
          "items.product": productId,
        }).select("items.product");
        const productFreqs = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const id = item.product.toString();
            if (id !== productId) {
              productFreqs[id] =
                (productFreqs[id] || 0) + 1;
            }
          });
        });
        const topIds = Object.entries(productFreqs)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([id]) => id);
        return await Product.find({
          _id: { $in: topIds },
        }).select("name price image rating");
      })(),

      Product.find({})
        .sort({ rating: -1 })
        .limit(4)
        .select("name price image rating"),

      Product.find({ isTrending: true })
        .limit(4)
        .select("name price image rating"),
    ]);

    res.json({
      productId,
      recommendations: {
        similar: similar.slice(0, 3),
        frequentlyBought: frequentlyBought.slice(0, 3),
        topRated: category.slice(0, 3),
        trending: combo.slice(0, 3),
      },
    });
  } catch (err) {
    console.error("Get Recommendation Summary Error:", err);
    res.status(500).json({ message: err.message });
  }
};
