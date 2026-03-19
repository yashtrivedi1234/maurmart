import React from "react";
import { Zap } from "lucide-react";
import { ProductRecommendation } from "@/store/api/recommendationApi";
import { useNavigate } from "react-router-dom";

interface ComboDealCardProps {
  products: ProductRecommendation[];
  discount: number;
  discountType: string;
  originalTotal: number;
  discountedTotal: number;
  savings: number;
}

const ComboDealCard: React.FC<ComboDealCardProps> = ({
  products,
  discount,
  discountType,
  originalTotal,
  discountedTotal,
  savings,
}) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-orange-900">Combo Deal</h2>
        <span className="ml-auto bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Save {discount}%
        </span>
      </div>

      <p className="text-gray-700 mb-4">Get these products together and save!</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/shop/${product._id}`)}
          >
            <div className="bg-gray-100 rounded h-24 mb-2 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
              />
            </div>
            <p className="text-sm font-semibold truncate">{product.name}</p>
            <p className="text-orange-600 font-bold text-sm mt-1">
              ₹{product.price}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 border border-orange-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Original Total:</span>
          <span className="text-gray-900 line-through">₹{originalTotal}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Discount ({discountType}):</span>
          <span className="text-red-600 font-semibold">-₹{savings}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Final Price:</span>
          <span className="text-2xl font-bold text-orange-600">
            ₹{discountedTotal}
          </span>
        </div>
      </div>

      <button className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
        Add All to Cart
      </button>
    </div>
  );
};

export default ComboDealCard;
