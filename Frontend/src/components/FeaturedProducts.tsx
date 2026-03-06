import { Star, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProductsQuery } from "@/redux/api";
import { Product } from "@/types";
const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useGetFeaturedProductsQuery({});
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Featured Products
            </h2>
            <p className="text-muted-foreground">Handpicked deals just for you</p>
          </div>
          <Button variant="link" className="hidden md:inline-flex">
            View All →
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading && (
            <div className="col-span-full flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && (
            <div className="col-span-full text-center text-destructive py-10">
              Failed to load featured products.
            </div>
          )}
          {featuredProducts && featuredProducts.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No featured products found.
            </div>
          )}
          {featuredProducts && featuredProducts.map((product: Product) => {
            const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            return (
              <div
                key={product._id}
                className="group bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative bg-accent/50 h-44 md:h-52 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </span>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">₹{product.price}</span>
                      {product.originalPrice && <span className="text-xs text-muted-foreground line-through ml-1.5">₹{product.originalPrice}</span>}
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
