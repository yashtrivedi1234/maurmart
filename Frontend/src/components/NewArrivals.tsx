import { Star, ShoppingCart, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetNewArrivalsQuery } from "@/redux/api";
import { Product } from "@/types";
const NewArrivals = () => {
  const { data: newProducts, isLoading, error } = useGetNewArrivalsQuery({});
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            New Arrivals
          </h2>
        </div>
        <p className="text-muted-foreground mb-10">Fresh additions to our collection this week</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading && (
            <div className="col-span-full flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && (
            <div className="col-span-full text-center text-destructive py-10">
              Failed to load new arrivals.
            </div>
          )}
          {newProducts && newProducts.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No new arrivals found.
            </div>
          )}
          {newProducts && newProducts.map((product: Product) => {
            const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            return (
              <div
                key={product._id}
                className="group bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 border border-border"
              >
                <div className="relative bg-accent/40 h-44 md:h-52 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </span>
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                    New
                  </span>
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-card text-foreground text-xs font-semibold px-2 py-1 rounded-md border border-border">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">{product.rating}</span>
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

export default NewArrivals;
