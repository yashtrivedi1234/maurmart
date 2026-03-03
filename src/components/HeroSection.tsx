import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-gradient">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-medium mb-6 animate-fade-in">
              🛒 Free Delivery on Orders Above ₹499
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Your Daily Essentials,{" "}
              <span className="opacity-90">Delivered Fast</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Shop groceries, electronics, and everyday products at the best prices. Quality you can trust.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero-outline" size="lg" className="rounded-full text-base px-8">
                Shop Now <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="rounded-full text-base px-8">
                Explore Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹499" },
              { icon: Shield, title: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
