import { Clock, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTrendingProductsQuery } from "@/redux/api";
import { Product } from "@/types";
const TrendingDeals = () => {
  const { data: deals, isLoading, error } = useGetTrendingProductsQuery({});
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-6 w-6 text-destructive" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Trending Deals
          </h2>
        </div>
        <p className="text-muted-foreground mb-10">Limited-time offers — grab them before they're gone!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading && (
            <div className="col-span-full flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && (
            <div className="col-span-full text-center text-destructive py-10">
              Failed to load trending deals.
            </div>
          )}
          {deals && deals.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No trending deals found.
            </div>
          )}
          {deals && deals.map((deal: Product) => {
            const discount = deal.originalPrice ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100) : 0;
            
            // Randomly generate ending time and sold percentage for demo purposes since backend doesn't store this exactly yet
            const endsIn = "2h 15m"; 
            const sold = 78;
            
            return (
              <div
                key={deal._id}
                className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 border border-border"
              >
                <div className="bg-accent/40 h-40 flex items-center justify-center relative">
                  <span className="text-5xl">{deal.image}</span>
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{deal.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-lg text-foreground">₹{deal.price}</span>
                    {deal.originalPrice && <span className="text-sm text-muted-foreground line-through">₹{deal.originalPrice}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Ends in {endsIn}</span>
                  </div>
                  {/* Progress bar for sold */}
                  <div className="w-full h-2 rounded-full bg-accent mb-1">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${sold}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{sold}% sold</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">
            View All Deals →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingDeals;
