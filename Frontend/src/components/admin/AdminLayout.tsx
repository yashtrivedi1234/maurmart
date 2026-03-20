import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Flame,
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Menu,
  X,
  Image,
  Mail,
  MessageSquare,
  HelpCircle,
  Bell,
  BarChart3,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Logo from "@/assets/logo.png";
import { AdminProvider, useAdminContext } from "@/context/AdminContext";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { cn } from "@/lib/utils";

const AdminLayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, triggerGlobalRefresh } = useAdminContext();

  // Initialize real-time system
  useAdminRealtime({ enabled: true, verbose: false });

  const menuSections = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
        { name: "Notifications", path: "/admin/notifications", icon: Bell },
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ],
    },
    {
      label: "Commerce",
      items: [
        { name: "Products", path: "/admin/products", icon: Package },
        { name: "Trending", path: "/admin/trending", icon: Flame },
        { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
        { name: "Users", path: "/admin/users", icon: Users },
      ],
    },
    {
      label: "Content",
      items: [
        { name: "Media", path: "/admin/media", icon: Image },
        { name: "Hero Section", path: "/admin/hero", icon: Sparkles },
        { name: "Brands", path: "/admin/brands", icon: Image },
        { name: "Newsletter", path: "/admin/newsletter", icon: Mail },
        { name: "Messages", path: "/admin/contacts", icon: MessageSquare },
        { name: "FAQs", path: "/admin/faqs", icon: HelpCircle },
      ],
    },
  ];

  const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/analytics": "Analytics",
    "/admin/products": "Products",
    "/admin/trending": "Trending Products",
    "/admin/orders": "Orders",
    "/admin/users": "Users",
    "/admin/media": "Media",
    "/admin/hero": "Hero Section",
    "/admin/brands": "Brands",
    "/admin/notifications": "Notifications",
    "/admin/newsletter": "Newsletter",
    "/admin/contacts": "Messages",
    "/admin/faqs": "FAQs",
    "/admin/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "Admin";
  const currentSection = location.pathname === "/admin" ? "Overview" : "Admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      {/* Sidebar - Desktop */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r border-white/10 bg-slate-950 text-white md:flex md:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="MaurMart" className="h-12 w-auto object-contain drop-shadow-md" />
            
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">System Status</p>
            <div className="mt-3 flex items-center gap-2">
              {isConnected ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-amber-400" />}
              <span className="text-sm font-medium text-slate-100">
                {isConnected ? "Real-time connected" : "Polling fallback active"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                {section.label}
              </p>
              <div className="mt-3 space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                        isActive
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-cyan-950/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      <ChevronRight className={cn("ml-auto h-4 w-4 transition-opacity", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60")} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Store</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] border-r border-slate-200 bg-white/95 backdrop-blur-xl transform transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="border-b border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Maurya Mart" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="font-display font-bold text-foreground">MaurMart</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Admin Panel</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="space-y-5 overflow-y-auto px-4 py-5">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{section.label}</p>
              <div className="mt-2 space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t bg-white/95 p-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Store</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Maurya Mart" className="h-8 w-auto object-contain" />
            <div>
              <p className="font-display text-sm font-bold text-slate-900">MaurMart Admin</p>
              <p className="text-[11px] text-slate-500">{currentTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-semibold text-green-700">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-orange-500" />
                  <span className="text-[10px] font-semibold text-orange-700">Polling</span>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          </div>
        </header>

        {/* Desktop Header with Connection Status */}
       

        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <AdminProvider>
      <AdminLayoutContent />
    </AdminProvider>
  );
};

export default AdminLayout;
