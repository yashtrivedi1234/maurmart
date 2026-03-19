import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/orders`,
    prepareHeaders: (headers) => {
      // Check admin token first, then user token (admin token takes priority for admin endpoints)
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");
      const token = adminToken || userToken;
      
      if (token) {
        console.log("🛍️ Sending token in Order Authorization header:", token.substring(0, 50) + "...");
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("⚠️ No token found in localStorage for Order API");
      }
      
      return headers;
    },
  }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/create",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),
    getUserOrders: builder.query({
      query: () => "/user-orders",
      providesTags: ["Order"],
    }),
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Order"],
    }),
    getAllOrders: builder.query({
      query: () => "/",
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetUserOrdersQuery, 
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation
} = orderApi;
