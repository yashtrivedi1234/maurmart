import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newsletterApi = createApi({
  reducerPath: "newsletterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/newsletter",
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
  }),
});

export const { useGetNewslettersQuery } = newsletterApi;
