import React, { useMemo } from "react";
import { BarChart3, BadgeIndianRupee, ShoppingBag, Users, Layers3 } from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetAllOrdersQuery } from "@/store/api/orderApi";
import { useGetAllUsersQuery } from "@/store/api/authApi";

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  user?: { _id?: string };
}

const AdminAnalytics = () => {
  const { data: productsResponse = [] } = useGetProductsQuery({});
  const { data: ordersResponse = [] } = useGetAllOrdersQuery({});
  const { data: usersResponse = [] } = useGetAllUsersQuery();

  const products = (productsResponse?.data || productsResponse || []) as Array<{ category?: string; stock?: number }>;
  const orders = (ordersResponse?.data || ordersResponse || []) as Order[];
  const users = (usersResponse?.data || usersResponse || []) as Array<{ _id: string }>;

  const { revenue, paidOrders, categoryBreakdown, topCategory, activeUsers } = useMemo(() => {
    const revenueTotal = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const paid = orders.filter((order) => ["paid", "completed"].includes((order.paymentStatus || "").toLowerCase()));
    const userIds = new Set(orders.map((order) => order.user?._id).filter(Boolean));
    const categories = products.reduce<Record<string, number>>((acc, product) => {
      const key = product.category?.trim() || "Uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    return {
      revenue: revenueTotal,
      paidOrders: paid.length,
      categoryBreakdown: sortedCategories,
      topCategory: sortedCategories[0],
      activeUsers: userIds.size,
    };
  }, [orders, products]);

  const summaryCards = [
    { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: BadgeIndianRupee, color: "bg-green-500" },
    { label: "Orders", value: orders.length, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Users", value: users.length, icon: Users, color: "bg-purple-500" },
    { label: "Categories", value: categoryBreakdown.length, icon: Layers3, color: "bg-cyan-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Live business metrics for users, orders, revenue, and categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 border shadow-sm">
            <div className={`inline-flex rounded-xl p-3 text-white ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Category Distribution</h2>
          </div>
          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No category data available yet.</p>
            ) : (
              categoryBreakdown.map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">{category}</span>
                    <span className="text-muted-foreground">{count} products</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / Math.max(products.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h2 className="text-xl font-display font-bold mb-6">Highlights</h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/30 p-4 border">
              <p className="text-xs font-bold uppercase text-muted-foreground">Top Category</p>
              <p className="text-lg font-semibold mt-1">{topCategory?.[0] || "N/A"}</p>
              <p className="text-sm text-muted-foreground mt-1">{topCategory?.[1] || 0} products</p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4 border">
              <p className="text-xs font-bold uppercase text-muted-foreground">Active Users</p>
              <p className="text-lg font-semibold mt-1">{activeUsers}</p>
              <p className="text-sm text-muted-foreground mt-1">Users with at least one order</p>
            </div>
            <div className="rounded-2xl bg-muted/30 p-4 border">
              <p className="text-xs font-bold uppercase text-muted-foreground">Paid Orders</p>
              <p className="text-lg font-semibold mt-1">{paidOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">Orders marked paid/completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
