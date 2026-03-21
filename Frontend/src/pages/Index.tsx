import HeroSection from "@/components/HeroSection";
import DeliveryBanner from "@/components/DeliveryBanner";
import OfferStrip from "@/components/OfferStrip";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrendingDeals from "@/components/TrendingDeals";
import NewArrivals from "@/components/NewArrivals";
import StatsSection from "@/components/StatsSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import TrustSection from "@/components/TrustSection";
import BrandsSection from "@/components/BrandsSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import AnimatedSection from "@/components/AnimatedSection";
import TrendingProductsSection from "@/components/TrendingProductsSection";
import BestSellersByCategory from "@/components/BestSellersByCategory";
import FAQPreview from "@/components/FAQPreview";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import { useGetTrendingProductsQuery } from "@/store/api/recommendationApi";

const Index = () => {
  const { data: trendingData, isLoading } = useGetTrendingProductsQuery();

  return (
    <>
      <HeroSection />
      <DeliveryBanner />
      <OfferStrip />
      <AnimatedSection>
        <CategoriesSection />
      </AnimatedSection>
      <AnimatedSection>
        <BestSellersByCategory />
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
        <TrustSection />
      </AnimatedSection>
      <AnimatedSection>
        <WhyChooseUs />
      </AnimatedSection>
      <AnimatedSection>
        <FAQPreview />
      </AnimatedSection>
      <AnimatedSection>
        <RecentlyViewedSection />
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
