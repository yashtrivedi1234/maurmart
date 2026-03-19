import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";
import { Product } from "./productApi";

// Response interfaces
export interface ProductRecommendation {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

export interface SimilarProductsResponse {
  success: boolean;
  message: string;
  data: ProductRecommendation[];
}

export interface FrequentlyBoughtTogetherResponse {
  success: boolean;
  message: string;
  data: ProductRecommendation[];
}

export interface CategoryProductsResponse {
  success: boolean;
  message: string;
  data: ProductRecommendation[];
}

export interface TrendingProductsResponse {
  success: boolean;
  message: string;
  data: ProductRecommendation[];
}

export interface PersonalizedRecommendationsResponse {
  success: boolean;
  message: string;
  data: ProductRecommendation[];
}

export interface ComboDealResponse {
  success: boolean;
  message: string;
  data: {
    products: ProductRecommendation[];
    discount: number;
    discountType: string;
    originalTotal: number;
    discountedTotal: number;
    savings: number;
  };
}

export interface RecommendationSummaryResponse {
  success: boolean;
  message: string;
  data: {
    similarProducts: ProductRecommendation[];
    frequentlyBoughtTogether: ProductRecommendation[];
    categoryProducts: ProductRecommendation[];
    comboDeal: {
      products: ProductRecommendation[];
      discount: number;
      discountType: string;
    };
  };
}

export const recommendationApi = createApi({
  reducerPath: "recommendationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/recommendations`,
    prepareHeaders: (headers) => {
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");
      const token = adminToken || userToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Recommendation"],
  endpoints: (builder) => ({
    getSimilarProducts: builder.query<SimilarProductsResponse, string>({
      query: (productId) => `/similar/${productId}`,
      providesTags: ["Recommendation"],
    }),
    getFrequentlyBoughtTogether: builder.query<
      FrequentlyBoughtTogetherResponse,
      string
    >({
      query: (productId) => `/frequently-bought/${productId}`,
      providesTags: ["Recommendation"],
    }),
    getCategoryProducts: builder.query<CategoryProductsResponse, string>({
      query: (productId) => `/category/${productId}`,
      providesTags: ["Recommendation"],
    }),
    getTrendingProducts: builder.query<TrendingProductsResponse, void>({
      query: () => `/trending`,
      providesTags: ["Recommendation"],
    }),
    getPersonalizedRecommendations: builder.query<
      PersonalizedRecommendationsResponse,
      void
    >({
      query: () => `/personalized`,
      providesTags: ["Recommendation"],
    }),
    getComboDeal: builder.query<ComboDealResponse, string>({
      query: (productId) => `/combo-deal/${productId}`,
      providesTags: ["Recommendation"],
    }),
    getRecommendationSummary: builder.query<
      RecommendationSummaryResponse,
      string
    >({
      query: (productId) => `/summary/${productId}`,
      providesTags: ["Recommendation"],
    }),
  }),
});

export const {
  useGetSimilarProductsQuery,
  useGetFrequentlyBoughtTogetherQuery,
  useGetCategoryProductsQuery,
  useGetTrendingProductsQuery,
  useGetPersonalizedRecommendationsQuery,
  useGetComboDealQuery,
  useGetRecommendationSummaryQuery,
} = recommendationApi;
