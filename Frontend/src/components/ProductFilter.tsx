import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FilterOptions {
  stockStatus?: string;
  minStock?: number;
  maxStock?: number;
  sortByStock?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortByPrice?: string;
  search?: string;
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories?: string[];
  isLoading?: boolean;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  onFilterChange,
  categories = [],
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedSections, setExpandedSections] = useState({
    stock: true,
    price: false,
    category: false,
    sort: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStockStatusChange = (status: string) => {
    const newFilters = { ...filters, stockStatus: status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStockRangeChange = (field: "minStock" | "maxStock", value: string) => {
    const newFilters = {
      ...filters,
      [field]: value ? parseInt(value) : undefined,
    };
    // Remove undefined values
    if (!newFilters[field]) {
      delete newFilters[field];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    const newFilters = {
      ...filters,
      [field]: value ? parseFloat(value) : undefined,
    };
    if (!newFilters[field]) {
      delete newFilters[field];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = {
      ...filters,
      category: filters.category === category ? undefined : category,
    };
    if (!newFilters.category) {
      delete newFilters.category;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortType: string, sortValue: string) => {
    const newFilters = { ...filters };
    if (sortType === "stock") {
      newFilters.sortByStock = sortValue;
      delete newFilters.sortByPrice;
    } else if (sortType === "price") {
      newFilters.sortByPrice = sortValue;
      delete newFilters.sortByStock;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    const newFilters = {
      ...filters,
      search: value || undefined,
    };
    if (!newFilters.search) {
      delete newFilters.search;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search products..."
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {/* Stock Status Filter */}
      <div className="border-b mb-4">
        <button
          onClick={() => toggleSection("stock")}
          className="w-full flex justify-between items-center py-3 font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          <span>Stock Status</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.stock ? "rotate-180" : ""}`}
          />
        </button>

        {expandedSections.stock && (
          <div className="pb-4 space-y-2">
            {[
              { label: "In Stock", value: "inStock" },
              { label: "Low Stock (1-10)", value: "lowStock" },
              { label: "Out of Stock", value: "outOfStock" },
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="stockStatus"
                  value={option.value}
                  checked={filters.stockStatus === option.value}
                  onChange={() => handleStockStatusChange(option.value)}
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
            {filters.stockStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStockStatusChange("")}
                className="text-xs"
              >
                Clear Stock Filter
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stock Range Filter */}
      <div className="border-b mb-4 pb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Stock Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min Stock"
            value={filters.minStock || ""}
            onChange={(e) => handleStockRangeChange("minStock", e.target.value)}
            disabled={isLoading}
            min="0"
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Max Stock"
            value={filters.maxStock || ""}
            onChange={(e) => handleStockRangeChange("maxStock", e.target.value)}
            disabled={isLoading}
            min="0"
            className="text-sm"
          />
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-b mb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center py-3 font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          <span>Price Range</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
          />
        </button>

        {expandedSections.price && (
          <div className="pb-4 grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice || ""}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              disabled={isLoading}
              min="0"
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ""}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              disabled={isLoading}
              min="0"
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="border-b mb-4">
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex justify-between items-center py-3 font-semibold text-gray-800 hover:text-blue-600 transition"
          >
            <span>Category</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.category && (
            <div className="pb-4 space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.category === cat}
                    onChange={() => handleCategoryChange(cat)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sorting */}
      <div className="border-b mb-4">
        <button
          onClick={() => toggleSection("sort")}
          className="w-full flex justify-between items-center py-3 font-semibold text-gray-800 hover:text-blue-600 transition"
        >
          <span>Sort By</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSections.sort ? "rotate-180" : ""}`}
          />
        </button>

        {expandedSections.sort && (
          <div className="pb-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Stock</p>
              {[
                { label: "Low to High", value: "asc" },
                { label: "High to Low", value: "desc" },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock-sort"
                    value={option.value}
                    checked={filters.sortByStock === option.value}
                    onChange={() => handleSortChange("stock", option.value)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Price</p>
              {[
                { label: "Low to High", value: "asc" },
                { label: "High to Low", value: "desc" },
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price-sort"
                    value={option.value}
                    checked={filters.sortByPrice === option.value}
                    onChange={() => handleSortChange("price", option.value)}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {Object.keys(filters).length > 0 && (
        <Button
          onClick={handleResetFilters}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          disabled={isLoading}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

export default ProductFilter;
