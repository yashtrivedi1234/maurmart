import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AdminContextType {
  // Real-time status
  isConnected: boolean;
  lastUpdate: Date;
  isRefreshing: boolean;

  // Refresh triggers
  triggerDashboardRefresh: () => void;
  triggerProductsRefresh: () => void;
  triggerOrdersRefresh: () => void;
  triggerUsersRefresh: () => void;
  triggerBrandsRefresh: () => void;
  triggerNewsletterRefresh: () => void;
  triggerFAQRefresh: () => void;
  triggerContactRefresh: () => void;
  triggerHeroRefresh: () => void;
  triggerTrendingRefresh: () => void;

  // Global refresh all
  triggerGlobalRefresh: () => void;

  // Polling interval
  pollingInterval: number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pollingInterval] = useState(5000); // 5 seconds

  // Refresh callback functions - these trigger component-specific refreshes
  const triggerDashboardRefresh = useCallback(() => {
    setLastUpdate(new Date());
    // Dispatch event for dashboard
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "dashboard" },
      })
    );
  }, []);

  const triggerProductsRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "products" },
      })
    );
  }, []);

  const triggerOrdersRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "orders" },
      })
    );
  }, []);

  const triggerUsersRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "users" },
      })
    );
  }, []);

  const triggerBrandsRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "brands" },
      })
    );
  }, []);

  const triggerNewsletterRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "newsletter" },
      })
    );
  }, []);

  const triggerFAQRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "faq" },
      })
    );
  }, []);

  const triggerContactRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "contact" },
      })
    );
  }, []);

  const triggerHeroRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "hero" },
      })
    );
  }, []);

  const triggerTrendingRefresh = useCallback(() => {
    setLastUpdate(new Date());
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "trending" },
      })
    );
  }, []);

  const triggerGlobalRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    
    // Trigger all refreshes
    window.dispatchEvent(
      new CustomEvent("admin-refresh", {
        detail: { page: "all" },
      })
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  // Simulate connection on mount
  useEffect(() => {
    setIsConnected(true);
  }, []);

  const value: AdminContextType = {
    isConnected,
    lastUpdate,
    isRefreshing,
    triggerDashboardRefresh,
    triggerProductsRefresh,
    triggerOrdersRefresh,
    triggerUsersRefresh,
    triggerBrandsRefresh,
    triggerNewsletterRefresh,
    triggerFAQRefresh,
    triggerContactRefresh,
    triggerHeroRefresh,
    triggerTrendingRefresh,
    triggerGlobalRefresh,
    pollingInterval,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
};
