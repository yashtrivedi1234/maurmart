import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ShieldCheck, RefreshCw, UserCog, ArrowRight } from "lucide-react";

const AdminSettings = () => {
  const navigate = useNavigate();

  const settingItems = [
    {
      title: "Admin Access",
      description: "Review authenticated admin-only areas and user controls.",
      icon: UserCog,
      action: () => navigate("/admin/users"),
      cta: "Open Users",
    },
    {
      title: "Store Content",
      description: "Manage FAQs, hero content, and customer-facing updates.",
      icon: Settings,
      action: () => navigate("/admin/faqs"),
      cta: "Open FAQs",
    },
    {
      title: "System Safety",
      description: "Use protected admin routes and refresh tools to keep dashboard data current.",
      icon: ShieldCheck,
      action: () => navigate("/admin"),
      cta: "Open Dashboard",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Operational shortcuts and admin controls available in the current build.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {settingItems.map((item) => (
          <div key={item.title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="inline-flex rounded-xl p-3 bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <button onClick={item.action} className="mt-5 inline-flex items-center gap-2 text-primary font-semibold">
              {item.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Admin Notes</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The current project does not yet expose a dedicated backend settings API.</p>
          <p>This screen groups the operational areas the team asked for until deeper settings controls are added.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
