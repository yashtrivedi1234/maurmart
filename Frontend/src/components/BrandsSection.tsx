import { useGetBrandsQuery } from "@/store/api/brandApi";
import { Loader2 } from "lucide-react";

const BrandsSection = () => {
  const { data: brands = [], isLoading } = useGetBrandsQuery({});

  if (isLoading) {
    return (
      <section className="py-14 border-y border-border">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="py-14 border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8 tracking-wide uppercase">
          Trusted Brands We Partner With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {brands.map((brand: any) => (
            <div
              key={brand._id}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <img
                src={brand.image}
                alt="Brand"
                className="h-12 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
