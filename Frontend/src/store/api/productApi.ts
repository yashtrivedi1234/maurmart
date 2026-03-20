import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export interface ProductReview {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: ProductReview[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  highlights?: string[];
  specifications?: { label: string; value: string }[];
  questions?: { question: string; answer: string }[];
  inTheBox?: string[];
  bankOffers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
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

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_BASE_URL}/api/products`,
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
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (filters?: ProductFilters) => {
        if (!filters || Object.keys(filters).length === 0) {
          return "/";
        }
        
        const params = new URLSearchParams();
        
        if (filters.stockStatus) params.append("stockStatus", filters.stockStatus);
        if (filters.minStock !== undefined) params.append("minStock", String(filters.minStock));
        if (filters.maxStock !== undefined) params.append("maxStock", String(filters.maxStock));
        if (filters.sortByStock) params.append("sortByStock", filters.sortByStock);
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
        if (filters.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
        if (filters.sortByPrice) params.append("sortByPrice", filters.sortByPrice);
        if (filters.search) params.append("search", filters.search);
        
        return `/?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    getTrendingProducts: builder.query({
      query: () => "/trending",
      providesTags: ["Product"],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, statusData }) => ({
        url: `/admin/${id}/status`,
        method: "PATCH",
        body: statusData,
      }),
      invalidatesTags: ["Product"],
    }),
    addReview: builder.mutation({
      query: ({ id, reviewData }) => ({
        url: `/${id}/reviews`,
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),
    checkCanReview: builder.query<{ canReview: boolean }, string>({
      query: (id) => `/${id}/can-review`,
    }),
  }),
});

export const { 
  useGetProductsQuery, 
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTrendingProductsQuery,
  useUpdateProductStatusMutation,
  useAddReviewMutation,
  useCheckCanReviewQuery
} = productApi;
