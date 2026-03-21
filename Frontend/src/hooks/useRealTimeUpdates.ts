import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "@/context/SocketContext";
import { productApi } from "@/store/api/productApi";
import { brandApi } from "@/store/api/brandApi";
import { heroApi } from "@/store/api/heroApi";
import { faqApi } from "@/store/api/faqApi";
import { testimonialApi } from "@/store/api/testimonialApi";
import { recommendationApi } from "@/store/api/recommendationApi";

/**
 * useRealTimeUpdates Hook
 * Listens to Socket.IO events from the admin panel and automatically refreshes data
 * Supports: Products, Brands, Hero Slides, FAQs, Testimonials, Recommendations
 */
export const useRealTimeUpdates = () => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    /* ─── PRODUCT EVENTS ─── */
    socket.on("productCreated", (data) => {
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productUpdated", (data) => {
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productDeleted", (data) => {
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    socket.on("productStatusChanged", (data) => {
      dispatch(productApi.util.invalidateTags(["Product"]));
      dispatch(recommendationApi.util.invalidateTags(["Recommendation"]));
    });

    /* ─── BRAND EVENTS ─── */
    socket.on("brandCreated", (data) => {
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    socket.on("brandDeleted", (data) => {
      dispatch(brandApi.util.invalidateTags(["Brand"]));
    });

    /* ─── HERO SLIDE EVENTS ─── */
    socket.on("heroSlideCreated", (data) => {
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideUpdated", (data) => {
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    socket.on("heroSlideDeleted", (data) => {
      dispatch(heroApi.util.invalidateTags(["Hero"]));
    });

    /* ─── FAQ EVENTS ─── */
    socket.on("faqCreated", (data) => {
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqUpdated", (data) => {
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    socket.on("faqDeleted", (data) => {
      dispatch(faqApi.util.invalidateTags(["FAQ"]));
    });

    /* ─── TESTIMONIAL EVENTS ─── */
    socket.on("testimonialCreated", (data) => {
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialUpdated", (data) => {
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    socket.on("testimonialDeleted", (data) => {
      dispatch(testimonialApi.util.invalidateTags(["Testimonial"]));
    });

    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
      socket.off("productDeleted");
      socket.off("productStatusChanged");
      socket.off("brandCreated");
      socket.off("brandDeleted");
      socket.off("heroSlideCreated");
      socket.off("heroSlideUpdated");
      socket.off("heroSlideDeleted");
      socket.off("faqCreated");
      socket.off("faqUpdated");
      socket.off("faqDeleted");
      socket.off("testimonialCreated");
      socket.off("testimonialUpdated");
      socket.off("testimonialDeleted");
    };
  }, [socket, isConnected, dispatch]);
};
