import { Clock3, MapPin, Truck } from "lucide-react";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Preeti+Nagar,+Raheem+Nagar,+Dudauli,+Sitapur+Rd,+Lucknow,+Uttar+Pradesh+226021";

const items = [
  {
    icon: Truck,
    title: "Fast local delivery",
    desc: "Quick doorstep delivery across Lucknow service areas.",
  },
  {
    icon: Clock3,
    title: "Typical window",
    desc: "Most daily essentials reach you in 30 to 45 minutes.",
  },
  {
    icon: MapPin,
    title: "Serving now",
    desc: "Preeti Nagar, Raheem Nagar, Dudauli and nearby Sitapur Road areas.",
    href: MAPS_URL,
  },
];

const DeliveryBanner = () => {
  return (
    <section className="border-y bg-primary/5">
      <div className="container mx-auto px-4 py-5">
        <div className="grid gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, href }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl bg-background/80 p-4 border border-border/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {desc}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeliveryBanner;
