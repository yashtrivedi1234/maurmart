import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/apiBase";

interface UseRealtimeDashboardProps {
  onRefresh: () => void;
  pollingInterval?: number; // in milliseconds, default 5000 (5 seconds)
  enabled?: boolean;
}

/**
 * Hook for real-time dashboard updates
 * Combines Socket.IO events with polling mechanism
 * Automatically triggers refresh when new data is available
 */
export const useRealtimeDashboard = ({
  onRefresh,
  pollingInterval = 5000,
  enabled = true,
}: UseRealtimeDashboardProps) => {
  const socketRef = useRef<Socket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !API_BASE_URL) return;

    // Initialize Socket.IO connection
    const token = localStorage.getItem("adminToken");

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
      console.log("✅ Connected to real-time dashboard");
      
      // Notify server that admin is on dashboard
      socketRef.current?.emit("joinDashboard", {
        adminId: localStorage.getItem("adminId") || "unknown",
      });
    });

    // Listen for dashboard reload events
    socketRef.current.on("dashboardReload", () => {
      console.log("🔄 Real-time dashboard update received");
      onRefresh();
    });

    // Order status updated event
    socketRef.current.on("orderStatusUpdated", (data: { orderId: string; oldStatus: string; newStatus: string; timestamp: Date }) => {
      console.log("📦 Order status changed:", data);
      onRefresh();
    });

    // New order event
    socketRef.current.on("orderCreated", (data: { orderId: string; customerId: string; totalPrice: number; itemsCount: number; timestamp: Date }) => {
      console.log("🆕 New order created:", data);
      onRefresh();
    });

    // Disconnect event
    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from real-time dashboard");
    });

    // Error event
    socketRef.current.on("error", (error: string) => {
      console.error("🔴 Socket error:", error);
    });

    // Set up polling interval for additional reliability
    pollingIntervalRef.current = setInterval(() => {
      console.log("⏰ Polling for updates...");
      onRefresh();
    }, pollingInterval);

    // Cleanup
    return () => {
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Leave dashboard room
      socketRef.current?.emit("leaveDashboard");

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("dashboardReload");
        socketRef.current.off("orderStatusUpdated");
        socketRef.current.off("orderCreated");
        socketRef.current.off("disconnect");
        socketRef.current.off("error");
        socketRef.current.disconnect();
      }
    };
  }, [enabled, onRefresh, pollingInterval]);

  // Function to manually trigger refresh
  const triggerRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    onRefresh();
  };

  // Function to reconnect socket
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    triggerRefresh,
    reconnect,
    isConnected: socketRef.current?.connected || false,
  };
};
