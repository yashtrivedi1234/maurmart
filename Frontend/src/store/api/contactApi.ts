import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/contacts`,
    prepareHeaders: (headers) => {
      // Check token first (user token takes priority)
      const userToken = localStorage.getItem("token");
      const token = userToken;
      
      if (token) {
        console.log("📧 Sending USER token in Contact Authorization header:", token.substring(0, 50) + "...");
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("⚠️ No user token found in localStorage for Contact API");
      }
      
      return headers;
    },
  }),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: () => "/",
      providesTags: ["Contact"],
    }),
    submitContact: builder.mutation({
      query: (data) => ({
        url: "/submit",
        method: "POST",
        body: data,
      }),
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Contact"],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useSubmitContactMutation,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,
} = contactApi;
