import { BadgePercent, CreditCard, Gift, Ticket } from "lucide-react";

const offers = [
  { icon: Gift, label: "20% off on first order" },
  { icon: BadgePercent, label: "Free delivery above ₹499" },
  { icon: CreditCard, label: "Instant bank offers on select cards" },
  { icon: Ticket, label: "Combo savings on everyday essentials" },
];

const OfferStrip = () => {
  return (
    <section className="bg-foreground text-primary-foreground">
      <div className="container mx-auto overflow-hidden px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center">
          {offers.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-primary-foreground/85">
              <Icon className="h-4 w-4 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfferStrip;
