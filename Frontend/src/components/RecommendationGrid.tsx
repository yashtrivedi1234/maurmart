import React from "react";
import { ProductRecommendation } from "@/store/api/recommendationApi";
import { useNavigate } from "react-router-dom";

interface RecommendationGridProps {
  title: string;
  recommendations: ProductRecommendation[];
  isLoading?: boolean;
  columns?: number;
}

const RecommendationGrid: React.FC<RecommendationGridProps> = ({
  title,
  recommendations,
  isLoading = false,
  columns = 4,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold mb-6">{title}</h3>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} gap-6`}
        >
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const gridColsClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl md:text-2xl font-bold mb-6">{title}</h3>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${
          gridColsClass[columns as keyof typeof gridColsClass]
        } gap-4`}
      >
        {recommendations.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
            onClick={() => navigate(`/shop/${product._id}`)}
          >
            <div className="relative bg-gray-100 h-40 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="p-3">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                {product.name}
              </h4>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-lg font-bold text-orange-600">
                  ₹{product.price}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <div className="flex text-yellow-400 text-xs">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
                    <span key={i} className="text-gray-300">
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full text-xs bg-orange-600 text-white py-1.5 rounded hover:bg-orange-700 transition-colors font-semibold">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationGrid;
