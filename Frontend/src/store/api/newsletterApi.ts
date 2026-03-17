import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export const newsletterApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/newsletter`,
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
  endpoints: (builder) => ({
    getNewsletters: builder.query({
      query: () => "/",
    }),
    subscribeNewsletter: builder.mutation({
      query: (body: { email: string }) => ({
        url: "/subscribe",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetNewslettersQuery, useSubscribeNewsletterMutation } = newsletterApi;
