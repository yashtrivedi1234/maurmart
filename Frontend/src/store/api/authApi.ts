import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/auth`,
    prepareHeaders: (headers) => {
      // Check admin token first, then user token (admin token takes priority for admin endpoints)
      const userToken = localStorage.getItem("token");
      const adminToken = localStorage.getItem("adminToken");
      const token = adminToken || userToken;
      
      if (token) {
        console.log("📤 Sending token in Authorization header:", token.substring(0, 50) + "...");
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("⚠️ No token found in localStorage");
      }
      
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    resendOtp: builder.mutation({
      query: (email) => ({
        url: "/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),
    getProfile: builder.query({
      query: () => {
        console.log("📥 Fetching profile...");
        return "/profile";
      },
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/update-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    uploadProfilePic: builder.mutation({
      query: (formData) => ({
        url: "/upload-profile-pic",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    getAllUsers: builder.query({
      query: () => "/admin/users",
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { 
  useRegisterMutation, 
  useLoginMutation, 
  useGetProfileQuery, 
  useVerifyOtpMutation, 
  useResendOtpMutation, 
  useUpdateProfileMutation,
  useUploadProfilePicMutation,
  useGetAllUsersQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = authApi;
