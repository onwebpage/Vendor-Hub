import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, CheckCheck, Package, ShoppingBag, Tag, Info, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  order:   { icon: Package,    color: "text-blue-500",   bg: "bg-blue-500/10" },
  payment: { icon: ShoppingBag,color: "text-green-500",  bg: "bg-green-500/10" },
  promo:   { icon: Tag,        color: "text-violet-500", bg: "bg-violet-500/10" },
  system:  { icon: Info,       color: "text-amber-500",  bg: "bg-amber-500/10" },
  default: { icon: Megaphone,  color: "text-primary",    bg: "bg-primary/10" },
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function CustomerNotifications() {
  const { data: notifications, isLoading, refetch } = useListNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { toast } = useToast();

  const list: any[] = notifications || [];
  const unreadCount = list.filter(n => !n.isRead).length;

  const handleMarkRead = (id: number) => {
    markRead({ id }, { onSuccess: () => refetch() });
  };

  const handleMarkAllRead = async () => {
    const unread = list.filter(n => !n.isRead);
    await Promise.all(unread.map(n => new Promise(res => markRead({ id: n.id }, { onSuccess: res }))));
    await refetch();
    toast({ title: "All notifications marked as read" });
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="rounded-xl gap-2" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4" />Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
          <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">Order updates, promotions and alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((n: any) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  n.isRead ? "bg-card border-border/50" : "bg-primary/5 border-primary/20 shadow-sm"
                }`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.isRead ? "text-foreground" : "text-foreground font-semibold"}`}>
                      {n.message || n.title || "Notification"}
                    </p>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-primary hover:underline flex-shrink-0 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.createdAt ? timeAgo(n.createdAt) : ""}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
