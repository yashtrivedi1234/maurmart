import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiBase";

export interface Testimonial {
  _id: string;
  name: string;
  email?: string;
  googleProfileUrl: string;
  profileImage: string;
  rating: number;
  title: string;
  review: string;
  verified: boolean;
  status: "approved" | "pending" | "rejected";
  helpful: number;
  notHelpful: number;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

export const testimonialApi = createApi({
  reducerPath: "testimonialApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_BASE_URL}/api/testimonials`,
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
  tagTypes: ["Testimonial"],
  endpoints: (builder) => ({
    // Get all approved testimonials
    getTestimonials: builder.query<Testimonial[], void>({
      query: () => "/",
      providesTags: ["Testimonial"],
    }),

    // Get testimonial by ID
    getTestimonialById: builder.query<Testimonial, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Testimonial", id }],
    }),

    // Create testimonial (admin)
    createTestimonial: builder.mutation<Testimonial, Partial<Testimonial>>({
      query: (newTestimonial) => ({
        url: "/",
        method: "POST",
        body: newTestimonial,
      }),
      invalidatesTags: ["Testimonial"],
    }),

    // Update testimonial (admin)
    updateTestimonial: builder.mutation<Testimonial, { id: string; data: Partial<Testimonial> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Testimonial", id }, "Testimonial"],
    }),

    // Update testimonial status (admin)
    updateTestimonialStatus: builder.mutation<Testimonial, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Testimonial", id }, "Testimonial"],
    }),

    // Delete testimonial (admin)
    deleteTestimonial: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonial"],
    }),

    // Mark helpful
    markHelpful: builder.mutation<Testimonial, { id: string; helpful: boolean }>({
      query: ({ id, helpful }) => ({
        url: `/${id}/helpful`,
        method: "POST",
        body: { helpful },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Testimonial", id }],
    }),

    // Get pending testimonials (admin)
    getPendingTestimonials: builder.query<Testimonial[], void>({
      query: () => "/admin/pending",
      providesTags: ["Testimonial"],
    }),
  }),
});

export const {
  useGetTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useUpdateTestimonialStatusMutation,
  useDeleteTestimonialMutation,
  useMarkHelpfulMutation,
  useGetPendingTestimonialsQuery,
} = testimonialApi;
