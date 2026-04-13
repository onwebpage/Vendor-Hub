import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, AlertCircle, Info, Package, ShoppingBag, Star, DollarSign, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@workspace/api-client-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchNotifications() {
  const token = await getAuthToken();
  const res = await fetch(`${API}/api/notifications`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

async function markRead(id: number) {
  const token = await getAuthToken();
  const res = await fetch(`${API}/api/notifications/${id}/read`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

async function markAllRead(notifications: any[]) {
  const token = await getAuthToken();
  const unread = notifications.filter((n) => !n.isRead);
  await Promise.all(
    unread.map((n) =>
      fetch(`${API}/api/notifications/${n.id}/read`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    )
  );
}

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  order: { icon: ShoppingBag, color: "text-blue-500 bg-blue-500/10" },
  product: { icon: Package, color: "text-violet-500 bg-violet-500/10" },
  payment: { icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
  review: { icon: Star, color: "text-amber-500 bg-amber-500/10" },
  announcement: { icon: Megaphone, color: "text-rose-500 bg-rose-500/10" },
  info: { icon: Info, color: "text-blue-400 bg-blue-400/10" },
};

function getTypeConfig(type: string) {
  return typeConfig[type] ?? typeConfig.info;
}

export default function VendorNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-notifications"],
    queryFn: fetchNotifications,
  });

  const { mutate: doMarkRead } = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] }),
  });

  const { mutate: doMarkAll, isPending: isMarkingAll } = useMutation({
    mutationFn: () => markAllRead(notifications as any[]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const filtered = filter === "unread"
    ? (notifications as any[]).filter((n) => !n.isRead)
    : notifications as any[];

  const unreadCount = (notifications as any[]).filter((n) => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display">Notifications</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => doMarkAll()} disabled={isMarkingAll}>
              {isMarkingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Mark all read
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? `All (${(notifications as any[]).length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="w-10 h-10 text-destructive/60" />
            <p>Failed to load notifications.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
            <div className="p-5 bg-muted/40 rounded-full">
              <Bell className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-sm mt-1">
                {filter === "unread" ? "You're all caught up!" : "Important updates about your store will appear here."}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((notif: any, i: number) => {
              const config = getTypeConfig(notif.type);
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-card border-border/40"
                      : "bg-primary/5 border-primary/20 shadow-sm"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${notif.isRead ? "text-foreground" : "text-foreground font-semibold"}`}>
                      {notif.title ?? "Notification"}
                    </p>
                    {notif.message && (
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs rounded-lg"
                        onClick={() => doMarkRead(notif.id)}
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
