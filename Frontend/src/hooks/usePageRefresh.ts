import { useEffect, useCallback } from "react";
import { useAdminContext } from "@/context/AdminContext";

interface UsePageRefreshProps {
  page: 
    | "dashboard"
    | "products"
    | "orders"
    | "users"
    | "brands"
    | "newsletter"
    | "faq"
    | "contact"
    | "hero"
    | "trending";
  onRefresh: () => void | Promise<void>;
}

/**
 * Hook for pages to listen to real-time refresh events
 * Usage: usePageRefresh({ page: "products", onRefresh: handleRefresh })
 */
export const usePageRefresh = ({ page, onRefresh }: UsePageRefreshProps) => {
  const { lastUpdate } = useAdminContext();

  useEffect(() => {
    const handleAdminRefresh = (event: CustomEvent<{ page: string }>) => {
      const refreshPage = event.detail.page;

      // Trigger refresh if event is for this page or all pages
      if (refreshPage === page || refreshPage === "all") {
        onRefresh();
      }
    };

    // Listen for admin refresh events
    window.addEventListener(
      "admin-refresh" as any,
      handleAdminRefresh as EventListener
    );

    return () => {
      window.removeEventListener(
        "admin-refresh" as any,
        handleAdminRefresh as EventListener
      );
    };
  }, [page, onRefresh]);

  return { lastUpdate };
};
