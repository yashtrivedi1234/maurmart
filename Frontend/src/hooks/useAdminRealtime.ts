import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/apiBase";
import { useAdminContext } from "@/context/AdminContext";

interface UseAdminRealtimeProps {
  enabled?: boolean;
  verbose?: boolean;
}

/**
 * Enhanced hook for admin panel real-time updates
 * Integrates with AdminContext and uses Socket.IO + Polling
 */
export const useAdminRealtime = ({
  enabled = true,
  verbose = false,
}: UseAdminRealtimeProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    triggerDashboardRefresh,
    triggerOrdersRefresh,
    triggerProductsRefresh,
    triggerUsersRefresh,
    triggerBrandsRefresh,
    triggerNewsletterRefresh,
    triggerFAQRefresh,
    triggerContactRefresh,
    triggerHeroRefresh,
    triggerTrendingRefresh,
    pollingInterval,
  } = useAdminContext();

  const log = (message: string, data?: any) => {
    if (verbose) {
      console.log(`🔄 [AdminRealtime] ${message}`, data || "");
    }
  };

  useEffect(() => {
    if (!enabled || !API_BASE_URL) return;

    const token = localStorage.getItem("adminToken");

    // Initialize Socket.IO connection
    socketRef.current = io(API_BASE_URL, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connect event
    socketRef.current.on("connect", () => {
      log("✅ Connected to admin panel");

      socketRef.current?.emit("joinAdminPanel", {
        adminId: localStorage.getItem("adminId") || "unknown",
      });
    });

    // ============ DASHBOARD EVENTS ============
    socketRef.current.on("dashboardReload", () => {
      log("🔄 Dashboard reload event");
      triggerDashboardRefresh();
    });

    socketRef.current.on("orderCreated", (data: any) => {
      log("📦 New order created", data);
      triggerOrdersRefresh();
      triggerDashboardRefresh();
    });

    socketRef.current.on("orderStatusUpdated", (data: any) => {
      log("📦 Order status updated", data);
      triggerOrdersRefresh();
      triggerDashboardRefresh();
    });

    // ============ PRODUCT EVENTS ============
    socketRef.current.on("productCreated", (data: any) => {
      log("📦 New product created", data);
      triggerProductsRefresh();
      triggerDashboardRefresh();
    });

    socketRef.current.on("productUpdated", (data: any) => {
      log("✏️ Product updated", data);
      triggerProductsRefresh();
      triggerDashboardRefresh();
    });

    socketRef.current.on("productDeleted", (data: any) => {
      log("🗑️ Product deleted", data);
      triggerProductsRefresh();
      triggerDashboardRefresh();
    });

    // ============ USER EVENTS ============
    socketRef.current.on("userCreated", (data: any) => {
      log("👤 New user registered", data);
      triggerUsersRefresh();
      triggerDashboardRefresh();
    });

    socketRef.current.on("userUpdated", (data: any) => {
      log("✏️ User updated", data);
      triggerUsersRefresh();
    });

    // ============ BRAND EVENTS ============
    socketRef.current.on("brandCreated", (data: any) => {
      log("🏷️ New brand created", data);
      triggerBrandsRefresh();
    });

    socketRef.current.on("brandUpdated", (data: any) => {
      log("✏️ Brand updated", data);
      triggerBrandsRefresh();
    });

    socketRef.current.on("brandDeleted", (data: any) => {
      log("🗑️ Brand deleted", data);
      triggerBrandsRefresh();
    });

    // ============ NEWSLETTER EVENTS ============
    socketRef.current.on("newsletterUpdated", (data: any) => {
      log("📧 Newsletter updated", data);
      triggerNewsletterRefresh();
    });

    // ============ FAQ EVENTS ============
    socketRef.current.on("faqCreated", (data: any) => {
      log("❓ New FAQ created", data);
      triggerFAQRefresh();
    });

    socketRef.current.on("faqUpdated", (data: any) => {
      log("✏️ FAQ updated", data);
      triggerFAQRefresh();
    });

    socketRef.current.on("faqDeleted", (data: any) => {
      log("🗑️ FAQ deleted", data);
      triggerFAQRefresh();
    });

    // ============ CONTACT/MESSAGE EVENTS ============
    socketRef.current.on("messageReceived", (data: any) => {
      log("💬 New message received", data);
      triggerContactRefresh();
      triggerDashboardRefresh();
    });

    // ============ HERO SECTION EVENTS ============
    socketRef.current.on("heroUpdated", (data: any) => {
      log("🎯 Hero section updated", data);
      triggerHeroRefresh();
    });

    // ============ TRENDING DEALS EVENTS ============
    socketRef.current.on("trendingUpdated", (data: any) => {
      log("🔥 Trending deals updated", data);
      triggerTrendingRefresh();
    });

    // ============ GENERAL ADMIN EVENT ============
    socketRef.current.on("adminPanelRefresh", (data: any) => {
      log("🔄 Admin panel refresh event", data);
      // Trigger all refreshes
      triggerDashboardRefresh();
      triggerOrdersRefresh();
      triggerProductsRefresh();
      triggerUsersRefresh();
    });

    // Disconnect event
    socketRef.current.on("disconnect", () => {
      log("❌ Disconnected from admin panel");
    });

    // Error event
    socketRef.current.on("error", (error: string) => {
      console.error("🔴 Socket error:", error);
    });

    // ============ POLLING FALLBACK ============
    pollingIntervalRef.current = setInterval(() => {
      log("⏰ Polling for updates");
      // Auto-refresh based on what the user is viewing
      // This is handled by individual pages
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      socketRef.current?.emit("leaveAdminPanel");

      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("dashboardReload");
        socketRef.current.off("orderCreated");
        socketRef.current.off("orderStatusUpdated");
        socketRef.current.off("productCreated");
        socketRef.current.off("productUpdated");
        socketRef.current.off("productDeleted");
        socketRef.current.off("userCreated");
        socketRef.current.off("userUpdated");
        socketRef.current.off("brandCreated");
        socketRef.current.off("brandUpdated");
        socketRef.current.off("brandDeleted");
        socketRef.current.off("newsletterUpdated");
        socketRef.current.off("faqCreated");
        socketRef.current.off("faqUpdated");
        socketRef.current.off("faqDeleted");
        socketRef.current.off("messageReceived");
        socketRef.current.off("heroUpdated");
        socketRef.current.off("trendingUpdated");
        socketRef.current.off("adminPanelRefresh");
        socketRef.current.off("disconnect");
        socketRef.current.off("error");
        socketRef.current.disconnect();
      }
    };
  }, [enabled, pollingInterval, triggerDashboardRefresh, triggerOrdersRefresh, triggerProductsRefresh, triggerUsersRefresh, triggerBrandsRefresh, triggerNewsletterRefresh, triggerFAQRefresh, triggerContactRefresh, triggerHeroRefresh, triggerTrendingRefresh]);

  return {
    isConnected: socketRef.current?.connected || false,
  };
};
