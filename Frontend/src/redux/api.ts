import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5001/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'User', 'Newsletter', 'Hero'],
  endpoints: (builder) => ({
    // Auth Endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Product Endpoints
    getProducts: builder.query({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    getFeaturedProducts: builder.query({
      query: () => '/products/featured',
      providesTags: ['Product'],
    }),
    getNewArrivals: builder.query({
      query: () => '/products/new-arrivals',
      providesTags: ['Product'],
    }),
    getTrendingProducts: builder.query({
      query: () => '/products/trending',
      providesTags: ['Product'],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/products/admin/${id}/status`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Product'],
    }),

    // Hero Endpoints
    getHeroSlides: builder.query({
      query: () => '/heroes',
      providesTags: ['Hero'],
    }),
    addHeroSlide: builder.mutation({
      query: (newSlide) => ({
        url: '/heroes',
        method: 'POST',
        body: newSlide,
      }),
      invalidatesTags: ['Hero'],
    }),
    deleteHeroSlide: builder.mutation({
      query: (id) => ({
        url: `/heroes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hero'],
    }),

    // Newsletter Endpoint
    subscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: '/newsletter/subscribe',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetTrendingProductsQuery,
  useUpdateProductStatusMutation,
  useGetHeroSlidesQuery,
  useAddHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useSubscribeNewsletterMutation,
} = baseApi;
