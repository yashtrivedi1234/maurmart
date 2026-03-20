import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { useGetNewslettersQuery } from "@/store/api/newsletterApi";
import { useGetContactsQuery } from "@/store/api/contactApi";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { data: newsletters = [] } = useGetNewslettersQuery({});
  const { data: contacts = [] } = useGetContactsQuery({});

  const contactSummary = useMemo(() => {
    const list = Array.isArray(contacts) ? contacts : [];
    return {
      total: list.length,
      newMessages: list.filter((item: any) => item.status === "new").length,
      replied: list.filter((item: any) => item.status === "replied").length,
    };
  }, [contacts]);

  const cards = [
    {
      title: "Newsletter Subscribers",
      count: Array.isArray(newsletters) ? newsletters.length : 0,
      description: "Customers subscribed to store updates and campaigns.",
      icon: Mail,
      path: "/admin/newsletter",
    },
    {
      title: "Customer Messages",
      count: contactSummary.total,
      description: `${contactSummary.newMessages} new and ${contactSummary.replied} replied conversations.`,
      icon: MessageSquare,
      path: "/admin/contacts",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Track subscriber updates and customer communication queues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="rounded-2xl border bg-white p-6 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl p-3 bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">{card.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            <p className="mt-5 text-3xl font-display font-bold">{card.count}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-display font-bold">Operational Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Subscribers</p>
            <p className="mt-2 text-2xl font-display font-bold">{Array.isArray(newsletters) ? newsletters.length : 0}</p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">New Messages</p>
            <p className="mt-2 text-2xl font-display font-bold">{contactSummary.newMessages}</p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Replied Messages</p>
            <p className="mt-2 text-2xl font-display font-bold">{contactSummary.replied}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
