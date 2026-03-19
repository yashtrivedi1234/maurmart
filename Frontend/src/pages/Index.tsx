import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrendingDeals from "@/components/TrendingDeals";
import NewArrivals from "@/components/NewArrivals";
import StatsSection from "@/components/StatsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import BrandsSection from "@/components/BrandsSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import AnimatedSection from "@/components/AnimatedSection";
import TrendingProductsSection from "@/components/TrendingProductsSection";
import { useGetTrendingProductsQuery } from "@/store/api/recommendationApi";

const Index = () => {
  const { data: trendingData, isLoading } = useGetTrendingProductsQuery();

  return (
    <>
      <HeroSection />
      <AnimatedSection>
        <CategoriesSection />
      </AnimatedSection>
      <AnimatedSection>
        <FeaturedProducts />
      </AnimatedSection>
      <AnimatedSection>
        <TrendingDeals />
      </AnimatedSection>
      {trendingData?.data && trendingData.data.length > 0 && (
        <AnimatedSection>
          <TrendingProductsSection
            products={trendingData.data}
            isLoading={isLoading}
          />
        </AnimatedSection>
      )}
      <AnimatedSection>
        <NewArrivals />
      </AnimatedSection>
      <AnimatedSection>
        <StatsSection />
      </AnimatedSection>
      <AnimatedSection>
        <WhyChooseUs />
      </AnimatedSection>
      <AnimatedSection>
        <BrandsSection />
      </AnimatedSection>
      <AnimatedSection>
        <Testimonials />
      </AnimatedSection>
      <AnimatedSection>
        <CTASection />
      </AnimatedSection>
    </>
  );
};

export default Index;

