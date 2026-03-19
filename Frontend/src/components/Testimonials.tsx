import { useGetTestimonialsQuery, Testimonial } from "@/store/api/testimonialApi";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkHelpfulMutation } from "@/store/api/testimonialApi";
import { toast } from "sonner";

const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#4285F4" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.9 17.7 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37.1 46.1 31.3 46.1 24.5z"/>
    <path fill="#FBBC05" d="M10.7 28.4A14.6 14.6 0 0 1 9.5 24c0-1.5.3-3 .7-4.4l-7-5.4A23 23 0 0 0 1 24c0 3.7.9 7.2 2.5 10.3l7.2-5.9z"/>
    <path fill="#EA4335" d="M24 47c5.6 0 10.4-1.9 13.9-5.1l-7-5.4C29.2 37.9 26.7 38.5 24 38.5c-6.3 0-11.6-4.4-13.3-10.2l-7.2 5.9C7 41.9 14.9 47 24 47z"/>
  </svg>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const [markHelpful, { isLoading }] = useMarkHelpfulMutation();

  const handleHelpful = async (helpfulValue: boolean) => {
    try {
      await markHelpful({ id: testimonial._id, helpful: helpfulValue }).unwrap();
      toast.success(helpfulValue ? "Marked as helpful" : "Marked as not helpful");
    } catch (err) {
      toast.error("Failed to mark helpful");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 space-y-4"
      style={{
        boxShadow:
          "0 0 0 1px hsl(var(--border)), 0 4px 12px -2px hsl(var(--foreground) / 0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Profile Image */}
          <a
            href={testimonial.googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img
              src={testimonial.profileImage}
              alt={testimonial.name}
              className="h-12 w-12 rounded-full object-cover border border-border hover:ring-2 ring-primary transition-all"
            />
          </a>

          {/* Name & Google Badge */}
          <div className="min-w-0">
            <a
              href={testimonial.googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
            >
              {testimonial.name}
            </a>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <GoogleLogo />
              <span className="text-xs text-muted-foreground">Google Review</span>
            </div>
          </div>
        </div>

        {/* Verified Badge */}
        {testimonial.verified && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              ✓ Verified
            </span>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3">
        {renderStars(testimonial.rating)}
        <span className="text-sm font-medium text-foreground">{testimonial.rating}.0</span>
      </div>

      {/* Review Title */}
      <h3 className="font-semibold text-foreground text-sm leading-snug">
        {testimonial.title}
      </h3>

      {/* Review Text */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {testimonial.review}
      </p>

      {/* Footer: Date & Helpful */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {new Date(testimonial.postedDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 gap-1 text-xs"
            disabled={isLoading}
            onClick={() => handleHelpful(true)}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{testimonial.helpful}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 gap-1 text-xs"
            disabled={isLoading}
            onClick={() => handleHelpful(false)}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>{testimonial.notHelpful}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { data: testimonials = [], isLoading } = useGetTestimonialsQuery();

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient blobs */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.06)" }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.06)" }}
      />

      <div className="container mx-auto px-4 relative">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              background: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))",
            }}
          >
            Verified Reviews
          </span>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
            What Our{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.55))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Customers Say
            </span>
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Trusted by thousands of happy shoppers across India — real reviews, straight from Google.
          </p>
        </div>

        {/* ── Testimonials Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial._id} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No testimonials yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;