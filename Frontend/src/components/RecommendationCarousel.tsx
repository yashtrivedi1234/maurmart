import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductRecommendation } from "@/store/api/recommendationApi";
import { useNavigate } from "react-router-dom";

interface RecommendationCarouselProps {
  title: string;
  recommendations: ProductRecommendation[];
  isLoading?: boolean;
}

const RecommendationCarousel: React.FC<RecommendationCarouselProps> = ({
  title,
  recommendations,
  isLoading = false,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setScrollPosition(newPosition);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-48 h-64 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
        >
          {recommendations.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-48 cursor-pointer group"
              onClick={() => navigate(`/shop/${product._id}`)}
            >
              <div className="bg-gray-100 rounded-lg overflow-hidden h-48 mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-sm truncate group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-bold text-orange-600">₹{product.price}</p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-600">({product.rating.toFixed(1)})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {scrollPosition > 0 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RecommendationCarousel;
