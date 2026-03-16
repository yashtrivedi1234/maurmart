import React, { useMemo } from "react";
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Loader2
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { useGetAllOrdersQuery } from "@/store/api/orderApi";

const AdminDashboard = () => {
  const { data: products = [] } = useGetProductsQuery({});
  const { data: users = [] } = useGetAllUsersQuery({});
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrdersQuery({});

  // Calculate total revenue and order count
  const { totalRevenue, totalOrders } = useMemo(() => {
    const total = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    return { totalRevenue: total, totalOrders: orders.length };
  }, [orders]);

  const stats = [
    { 
      name: "Total Products", 
      value: products?.length || 0, 
      icon: Package, 
      color: "bg-blue-500"
    },
    { 
      name: "Total Orders", 
      value: totalOrders, 
      icon: ShoppingBag, 
      color: "bg-primary"
    },
    { 
      name: "Total Users", 
      value: users?.length || 0, 
      icon: Users, 
      color: "bg-purple-500"
    },
    { 
      name: "Total Revenue", 
      value: `₹${totalRevenue.toLocaleString('en-IN')}`, 
      icon: TrendingUp, 
      color: "bg-orange-500"
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "shipped":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Recent Orders</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
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
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="group hover:bg-muted/30 transition-colors">
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
                      <td className="p-3 font-bold text-sm">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm">
          <h3 className="font-display font-bold text-lg mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Pending Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.filter((o: any) => o.orderStatus === 'processing').length}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Delivered Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.filter((o: any) => o.orderStatus === 'delivered').length}</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Shipped Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.filter((o: any) => o.orderStatus === 'shipped').length}</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Cancelled Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.filter((o: any) => o.orderStatus === 'cancelled').length}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
