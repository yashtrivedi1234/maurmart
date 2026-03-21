import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Loader2,
  RotateCw,
  Wifi,
  WifiOff,
  Zap,
  UserCheck,
  BadgeIndianRupee,
  Layers3,
  ChartColumn,
  Image,
  Bell,
  Settings,
  ArrowRight
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { useGetAllOrdersQuery } from "@/store/api/orderApi";
import { useAdminContext } from "@/context/AdminContext";
import { usePageRefresh } from "@/hooks/usePageRefresh";

// Order interface
interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
    _id: string;
  };
  items: Array<{
    product: { name: string; _id: string };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | string;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  paymentStatus: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // RTK Query hooks with refetch capability
  const productsQuery = useGetProductsQuery({});
  const usersQuery = useGetAllUsersQuery();
  const ordersQuery = useGetAllOrdersQuery({});

  const { data: productsResponse = [] } = productsQuery;
  const products = (productsResponse?.data || productsResponse || []) as any[];
  const { data: usersResponse = [] } = usersQuery;
  const users = (usersResponse?.data || usersResponse || []) as any[];
  const { data: ordersResponse = [], isLoading: ordersLoading } = ordersQuery;
  const orders = (ordersResponse?.data || ordersResponse || []) as Order[];

  // Get admin context
  const { isConnected, triggerDashboardRefresh } = useAdminContext();

  // Callback for refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        productsQuery.refetch(),
        usersQuery.refetch(),
        ordersQuery.refetch(),
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Error refreshing dashboard:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [productsQuery, usersQuery, ordersQuery]);

  // Listen for page refresh events
  usePageRefresh({
    page: "dashboard",
    onRefresh: handleRefresh,
  });

  // Calculate dashboard metrics
  const {
    totalRevenue,
    totalOrders,
    totalCategories,
    activeUsers,
    paidUsers,
    deliveredOrders,
    pendingOrders,
  } = useMemo(() => {
    const total = orders.reduce((sum: number, order: Order) => sum + (order.totalPrice || 0), 0);
    const categories = new Set(
      products
        .map((product: any) => product?.category?.trim())
        .filter(Boolean)
    );
    const orderingUsers = new Set(
      orders
        .map((order: Order) => order?.user?._id)
        .filter(Boolean)
    );
    const paidCustomerIds = new Set(
      orders
        .filter((order: Order) => ["paid", "completed"].includes((order.paymentStatus || "").toLowerCase()))
        .map((order: Order) => order?.user?._id)
        .filter(Boolean)
    );

    return {
      totalRevenue: total,
      totalOrders: orders.length,
      totalCategories: categories.size,
      activeUsers: orderingUsers.size,
      paidUsers: paidCustomerIds.size,
      deliveredOrders: orders.filter((order: Order) => order.status === "Delivered").length,
      pendingOrders: orders.filter((order: Order) => order.status === "Processing").length,
    };
  }, [orders]);

  const primaryStats = [
    { 
      name: "Total Products", 
      value: products?.length || 0, 
      icon: Package, 
      color: "bg-blue-500"
    },
    { 
      name: "Total Categories", 
      value: totalCategories, 
      icon: Layers3, 
      color: "bg-cyan-500"
    },
    { 
      name: "Total Orders", 
      value: totalOrders, 
      icon: ShoppingBag, 
      color: "bg-primary"
    },
    { 
      name: "Total Sales", 
      value: `₹${totalRevenue.toLocaleString('en-IN')}`, 
      icon: BadgeIndianRupee, 
      color: "bg-orange-500"
    },
  ];

  const userStats = [
    {
      name: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "bg-purple-500",
      caption: "All registered accounts",
    },
    {
      name: "Active Users",
      value: activeUsers,
      icon: UserCheck,
      color: "bg-emerald-500",
      caption: "Users with at least one order",
    },
    {
      name: "Paid Users",
      value: paidUsers,
      icon: BadgeIndianRupee,
      color: "bg-green-600",
      caption: "Users with paid/completed orders",
    },
  ];

  const dashboardModules = [
    {
      name: "Analytics",
      description: "Revenue, orders, users, and category performance.",
      icon: ChartColumn,
      path: "/admin/analytics",
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "Media",
      description: "Hero slides, brand assets, and storefront visuals.",
      icon: Image,
      path: "/admin/media",
      color: "text-fuchsia-600 bg-fuchsia-50",
    },
    {
      name: "Notifications",
      description: "Newsletter audience and customer contact updates.",
      icon: Bell,
      path: "/admin/notifications",
      color: "text-amber-600 bg-amber-50",
    },
    {
      name: "Settings",
      description: "Admin tools, system shortcuts, and operational controls.",
      icon: Settings,
      path: "/admin/settings",
      color: "text-slate-700 bg-slate-100",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Shipped":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Real-time indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border shadow-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-700">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-700">Polling</span>
                </>
              )}
            </div>

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Last update info */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>Last updated: {formatLastUpdate(lastUpdate)}</span>
        </div>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {primaryStats.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-in fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-display font-bold text-foreground mt-1 transition-all duration-300">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* User stats + quick modules */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg">User Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">Customer growth and conversion snapshot.</p>
            </div>
            <button onClick={() => navigate("/admin/users")} className="text-primary text-sm font-bold hover:underline">
              View Users
            </button>
          </div>
          <div className="space-y-4">
            {userStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{stat.name}</p>
                    <p className="text-xs text-muted-foreground">{stat.caption}</p>
                  </div>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg">Dashboard Modules</h3>
              <p className="text-sm text-muted-foreground mt-1">Shortcuts for the features requested on the main dashboard.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardModules.map((module) => (
              <button
                key={module.name}
                onClick={() => navigate(module.path)}
                className="text-left rounded-2xl border p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`inline-flex rounded-xl p-3 ${module.color}`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h4 className="mt-4 font-semibold text-foreground">{module.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-lg">Recent Orders</h3>
              {/* Live indicator for orders */}
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-green-700">Live</span>
              </div>
            </div>
            <button onClick={() => navigate("/admin/orders")} className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left bg-muted/50 rounded-lg">
                  <tr>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order: Order) => (
                    <tr 
                      key={order._id} 
                      className="group hover:bg-muted/30 transition-all duration-300 animate-in fade-in"
                    >
                      <td className="p-3 font-semibold text-sm">{`#${order._id?.slice(-6).toUpperCase() || 'N/A'}`}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                            {order.user?.name?.[0] || 'C'}
                          </div>
                          <div>
                            <span className="text-sm font-medium block">{order.user?.name || 'Guest'}</span>
                            <span className="text-xs text-muted-foreground">{order.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-sm">{formatCurrency(order.totalPrice)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${getStatusColor(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h3 className="font-display font-bold text-lg mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 p-3 bg-blue-50 rounded-r-lg transition-all duration-300 hover:shadow-md">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Pending Orders</p>
              <p className="text-3xl font-bold mt-1 text-blue-600 transition-all duration-300">
                {pendingOrders}
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 p-3 bg-green-50 rounded-r-lg transition-all duration-300 hover:shadow-md">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Delivered Orders</p>
              <p className="text-3xl font-bold mt-1 text-green-600 transition-all duration-300">
                {deliveredOrders}
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 p-3 bg-orange-50 rounded-r-lg transition-all duration-300 hover:shadow-md">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Shipped Orders</p>
              <p className="text-3xl font-bold mt-1 text-orange-600 transition-all duration-300">
                {orders.filter((o: Order) => o.status === 'Shipped').length}
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4 p-3 bg-red-50 rounded-r-lg transition-all duration-300 hover:shadow-md">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Cancelled Orders</p>
              <p className="text-3xl font-bold mt-1 text-red-600 transition-all duration-300">
                {orders.filter((o: Order) => o.status === 'Cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
