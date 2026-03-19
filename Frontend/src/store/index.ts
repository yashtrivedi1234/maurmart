import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { cartApi } from "./api/cartApi";
import { productApi } from "./api/productApi";
import { orderApi } from "./api/orderApi";
import { paymentApi } from "./api/paymentApi";
import { heroApi } from "./api/heroApi";
import { brandApi } from "./api/brandApi";
import { newsletterApi } from "./api/newsletterApi";
import { contactApi } from "./api/contactApi";
import { faqApi } from "./api/faqApi";
import { testimonialApi } from "./api/testimonialApi";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [heroApi.reducerPath]: heroApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [newsletterApi.reducerPath]: newsletterApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [testimonialApi.reducerPath]: testimonialApi.reducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      cartApi.middleware, 
      productApi.middleware, 
      orderApi.middleware,
      paymentApi.middleware,
      heroApi.middleware,
      brandApi.middleware,
      newsletterApi.middleware,
      contactApi.middleware,
      faqApi.middleware,
      testimonialApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
