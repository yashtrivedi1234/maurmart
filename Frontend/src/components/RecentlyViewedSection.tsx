import { Link } from "react-router-dom";
import { ArrowRight, History, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useGetProductsQuery, Product } from "@/store/api/productApi";
import {
  useGetPersonalizedRecommendationsQuery,
  ProductRecommendation,
} from "@/store/api/recommendationApi";

const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";

const normalizeRecommendationProduct = (
  recommendation: ProductRecommendation,
): Product => ({
  _id: recommendation._id,
  name: recommendation.name,
  description: "Recommended from your recent shopping activity.",
  price: recommendation.price,
  category: recommendation.category,
  image: recommendation.image,
  stock: 999,
  rating: recommendation.rating || 0,
  numReviews: 0,
  reviews: [],
  createdAt: "",
  updatedAt: "",
});

const RecentlyViewedSection = () => {
  const { data: response, isLoading } = useGetProductsQuery({});
  const allProducts = (response?.data || response || []) as Product[];
  const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("token"));
  const { data: personalized } = useGetPersonalizedRecommendationsQuery(undefined, { skip: !hasToken });

  const personalizedProducts = (personalized?.data || []).map(normalizeRecommendationProduct);
  const recentlyViewedIds =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]")
      : [];

  const recentlyViewedProducts = recentlyViewedIds
    .map((id: string) => allProducts.find((product) => product._id === id))
    .filter(Boolean)
    .slice(0, 4) as Product[];

  const productsToShow = hasToken && personalizedProducts.length > 0 ? personalizedProducts.slice(0, 4) : recentlyViewedProducts;
  const title = hasToken && personalizedProducts.length > 0 ? "Buy again or explore your picks" : "Recently viewed";
  const subtitle =
    hasToken && personalizedProducts.length > 0
      ? "A quick shortcut to products based on your shopping activity."
      : "Jump back into products you explored recently without searching again.";

  if (!isLoading && productsToShow.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {hasToken && personalizedProducts.length > 0 ? <ShoppingBag className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
              {hasToken && personalizedProducts.length > 0 ? "Buy Again" : "Recently Viewed"}
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">{title}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-sm font-semibold text-primary md:inline-flex">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-[380px] rounded-xl bg-muted animate-pulse" />
              ))
            : productsToShow.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
