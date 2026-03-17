import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/faqs`,
    prepareHeaders: (headers) => {
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");
      const token = adminToken || userToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["FAQ"],
  endpoints: (builder) => ({
    getFAQs: builder.query({
      query: () => "/",
      providesTags: ["FAQ"],
    }),
    createFAQ: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),
    updateFAQ: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),
    deleteFAQ: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
  }),
});

export const {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} = faqApi;
