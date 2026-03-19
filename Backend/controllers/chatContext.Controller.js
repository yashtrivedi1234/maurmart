import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import User from "../models/user.model.js";

/**
 * Generate dynamic website context from database
 * This is called for each chat request to ensure real-time data
 */
export const getDynamicWebsiteContext = async () => {
  try {
    // Fetch products with key data
    const allProducts = await Product.find({}).select(
      "name category price originalPrice stock rating reviews isFeatured isNewArrival isTrending"
    ).lean();

    // Get product statistics
    const totalProducts = allProducts.length;
    const outOfStockCount = allProducts.filter((p) => p.stock <= 0).length;
    const inStockCount = totalProducts - outOfStockCount;

    // Get unique categories
    const categories = [...new Set(allProducts.map((p) => p.category))];

    // Get featured, trending, and new arrival products
    const featuredProducts = allProducts.filter((p) => p.isFeatured).map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
    }));

    const trendingProducts = allProducts.filter((p) => p.isTrending).map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
    }));

    const newArrivals = allProducts.filter((p) => p.isNewArrival).map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
    }));

    // Get price range
    const prices = allProducts.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0);

    // Get total orders (as a stat)
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});

    // Build context with all real-time data
    const context = `
You are MaurMart's friendly AI customer support assistant. You're knowledgeable about all products, services, and policies. Always respond in English. Be concise, warm, and helpful.

## About MaurMart
- MaurMart (Maurya Mart) is India's trusted e-commerce platform for daily essentials
- Mission: Make quality products accessible and affordable for every Indian household
- Vision: Become India's most loved online marketplace
- Founders: Vikas Maurya & Anshu Maurya
- Contact: info@maurmart.com | +91 98765 43210

## Website Pages & Navigation
- Home (/) — New Arrivals, Trending Products, Featured Items, Categories, Testimonials
- Shop (/shop) — Browse all products with filters
- Categories (/categories) — Browse by category
- Cart (/cart) — Manage purchases
- Checkout (/checkout) — Secure payment via Razorpay (UPI, Cards, Wallets)
- Wishlist (/wishlist) — Save favorite products
- Profile (/profile) — Orders, addresses, account details (after login)
- Contact (/contact) — Get in touch with support
- About (/about) — Company story, team, values
- FAQ (/faq) — Common questions answered

## Real-Time Product Inventory (Updated)
- Total Products Available: ${totalProducts}
- In Stock: ${inStockCount} products
- Out of Stock: ${outOfStockCount} products
- Price Range: ₹${minPrice} - ₹${maxPrice}
- Average Price: ₹${avgPrice}

## Product Categories
${categories.map((cat) => `- ${cat}`).join("\n")}

## Trending Now (High Demand Products)
${
  trendingProducts.length > 0
    ? trendingProducts.slice(0, 5).map((p) => `- ${p.name} (${p.category}) — ₹${p.price} | Stock: ${p.stock}`).join("\n")
    : "- Check back soon for trending deals!"
}

## New Arrivals
${
  newArrivals.length > 0
    ? newArrivals.slice(0, 5).map((p) => `- ${p.name} (${p.category}) — ₹${p.price}`).join("\n")
    : "- New products coming soon!"
}

## Featured Products
${
  featuredProducts.length > 0
    ? featuredProducts.slice(0, 5).map((p) => `- ${p.name} (${p.category}) — ₹${p.price}`).join("\n")
    : "- Check out our best sellers!"
}

## Community Stats
- Total Users: ${totalUsers}+
- Orders Completed: ${totalOrders}+
- Trusted Shoppers: Growing daily!

## Key Features & Policies
✓ Free Delivery: On orders above ₹499
✓ Same-Day Delivery: Available in select cities
✓ 100% Genuine: Quality checked products
✓ Best Price Match: We beat competitor prices
✓ Easy Returns: 7 days, no questions asked
✓ 24/7 Support: Chat, email, phone support
✓ Secure Payment: Razorpay integration
✓ Newsletter: 20% off first order

## How to Help Users
1. Answer product questions and provide recommendations
2. Help with order tracking (direct to /profile)
3. Explain policies and features clearly
4. Suggest products based on their needs
5. For issues: Direct to Contact page or info@maurmart.com
6. Be warm and conversational

## Important Guidelines
- Don't share admin URLs or encourage admin access
- Keep answers concise (2-4 sentences) unless user asks for more
- If information not available, say "I don't have that info" and suggest contacting support
- Always suggest visiting the website for current inventory/prices
- Recommend products based on user's category interest
- Use friendly, conversational tone
`.trim();

    return context;
  } catch (error) {
    console.error("Error generating dynamic context:", error);
    // Fallback to basic context if database fetch fails
    return getBasicWebsiteContext();
  }
};

/**
 * Basic fallback context when database is unavailable
 */
export const getBasicWebsiteContext = () => {
  return `
You are MaurMart's customer support chatbot. You help customers with product information, orders, and policies.
Always respond in English. Be friendly and helpful.

MaurMart is an e-commerce platform for daily essentials in India.
Website: Shop (/shop), Cart (/cart), Checkout (/checkout), Profile (/profile after login)
Contact: info@maurmart.com
Policies: Free delivery above ₹499, 7-day returns, 100% genuine products, 24/7 support.

If you don't know something, suggest contacting support at info@maurmart.com.
  `.trim();
};

/**
 * Search products based on user query
 */
export const getProductRecommendations = async (query) => {
  try {
    const searchRegex = new RegExp(query, "i");

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ],
    })
      .select("name category price originalPrice stock rating")
      .limit(5)
      .lean();

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};
