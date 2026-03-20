import React from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Images, BadgeCheck, ArrowRight } from "lucide-react";
import { useGetHeroSlidesQuery } from "@/store/api/heroApi";
import { useGetBrandsQuery } from "@/store/api/brandApi";

const AdminMedia = () => {
  const navigate = useNavigate();
  const { data: heroSlides = [] } = useGetHeroSlidesQuery({});
  const { data: brands = [] } = useGetBrandsQuery({});

  const mediaCards = [
    {
      title: "Hero Slides",
      count: Array.isArray(heroSlides) ? heroSlides.length : 0,
      description: "Manage homepage banners and promotional creatives.",
      icon: Images,
      path: "/admin/hero",
    },
    {
      title: "Brand Assets",
      count: Array.isArray(brands) ? brands.length : 0,
      description: "Control logos shown in the brand strip and campaigns.",
      icon: BadgeCheck,
      path: "/admin/brands",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Media</h1>
        <p className="text-muted-foreground mt-1">A central place for brand assets and homepage visuals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mediaCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="rounded-2xl border bg-white p-6 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl p-3 bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">{card.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            <p className="mt-5 text-3xl font-display font-bold">{card.count}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ImagePlus className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Media Workflow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border bg-muted/20 p-4">1. Upload polished creative assets.</div>
          <div className="rounded-xl border bg-muted/20 p-4">2. Publish hero slides or brand logos from the respective sections.</div>
          <div className="rounded-xl border bg-muted/20 p-4">3. Refresh the storefront to verify changes propagate live.</div>
        </div>
      </div>
    </div>
  );
};

export default AdminMedia;
