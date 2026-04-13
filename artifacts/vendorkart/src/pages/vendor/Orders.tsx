import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag, AlertCircle, Package, Clock, CheckCircle2, Truck,
  XCircle, RotateCcw, ChevronDown, ChevronUp, IndianRupee,
  TrendingUp, ArrowUpRight, MapPin, Filter, Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthToken } from "@workspace/api-client-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchMyOrders() {
  const token = await getAuthToken();
  const res = await fetch(`${API}/api/vendors/my-orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

const orderStatusConfig: Record<string, { label: string; icon: React.ElementType; pill: string; dot: string; track: string }> = {
  pending:    { label: "Pending",    icon: Clock,        pill: "text-amber-700 bg-amber-500/15 border-amber-400/30",     dot: "bg-amber-400",    track: "bg-amber-400/20" },
  confirmed:  { label: "Confirmed",  icon: CheckCircle2, pill: "text-blue-700 bg-blue-500/15 border-blue-400/30",        dot: "bg-blue-500",     track: "bg-blue-500/20" },
  processing: { label: "Processing", icon: Package,      pill: "text-violet-700 bg-violet-500/15 border-violet-400/30",  dot: "bg-violet-500",   track: "bg-violet-500/20" },
  shipped:    { label: "Shipped",    icon: Truck,        pill: "text-indigo-700 bg-indigo-500/15 border-indigo-400/30",  dot: "bg-indigo-500",   track: "bg-indigo-500/20" },
  delivered:  { label: "Delivered",  icon: CheckCircle2, pill: "text-emerald-700 bg-emerald-500/15 border-emerald-400/30", dot: "bg-emerald-500", track: "bg-emerald-500/20" },
  cancelled:  { label: "Cancelled",  icon: XCircle,      pill: "text-red-700 bg-red-500/15 border-red-400/30",           dot: "bg-red-500",      track: "bg-red-500/20" },
  refunded:   { label: "Refunded",   icon: RotateCcw,    pill: "text-muted-foreground bg-muted border-border",           dot: "bg-muted-foreground/50", track: "bg-muted/40" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: "Unpaid",    color: "text-amber-600" },
  paid:     { label: "Paid",      color: "text-emerald-600" },
  failed:   { label: "Failed",    color: "text-red-600" },
  refunded: { label: "Refunded",  color: "text-muted-foreground" },
};

const ORDER_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = ORDER_STEPS.indexOf(status);
  if (currentIdx === -1 || status === "cancelled" || status === "refunded") return null;
  return (
    <div className="flex items-center gap-0 mt-4">
      {ORDER_STEPS.map((step, i) => {
        const cfg = orderStatusConfig[step];
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? `${cfg.dot} border-transparent`
                  : "bg-muted border-border/40"
              } ${active ? "ring-4 ring-offset-2 ring-offset-card" : ""}`}
                style={active ? { boxShadow: "0 0 0 3px var(--tw-ring-color)" } : {}}
              >
                {done
                  ? <cfg.icon className="w-3.5 h-3.5 text-white" />
                  : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                }
              </div>
              <span className={`text-[9px] font-semibold uppercase tracking-wide ${done ? "text-foreground" : "text-muted-foreground/50"}`}>
                {cfg.label}
              </span>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-all ${i < currentIdx ? cfg.dot : "bg-border/30"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, index }: { order: any; index: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const status = orderStatusConfig[order.status] || orderStatusConfig.pending;
  const payment = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
  const StatusIcon = status.icon;
  const vendorTotal = order.vendorItems?.reduce((acc: number, item: any) => acc + item.subtotal, 0) ?? 0;
  const itemCount = order.vendorItems?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-border/70 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
    >
      {/* Header row */}
      <div
        className="flex items-center gap-5 p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order badge */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${status.track}`}>
          <StatusIcon className={`w-5 h-5 ${status.dot.replace("bg-", "text-")}`} />
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-sm">#{order.orderNumber}</p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${status.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${order.status === "pending" ? "animate-pulse" : ""}`} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}{itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Amount & payment */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-foreground">₹{vendorTotal.toLocaleString("en-IN")}</p>
          <p className={`text-xs font-semibold ${payment.color}`}>{payment.label}</p>
        </div>

        {/* Chevron */}
        <div className={`p-1.5 rounded-lg bg-muted/50 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 px-5 pb-5 pt-4 space-y-4">
              {/* Timeline */}
              <OrderTimeline status={order.status} />

              {/* Your items label */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/40" />
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-2">Your Items</p>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {order.vendorItems?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3.5 rounded-xl bg-muted/30 border border-border/20 p-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted/50">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">₹{Number(item.subtotal).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              {order.shippingAddress && (
                <div className="flex items-start gap-3 bg-muted/20 border border-border/20 rounded-xl p-3.5">
                  <div className="p-1.5 bg-muted rounded-lg flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">Ship to</p>
                    <p className="text-sm font-semibold">{order.shippingAddress.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {[order.shippingAddress.addressLine1, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Total summary */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <p className="text-sm text-muted-foreground">Your earnings from this order</p>
                <p className="text-base font-bold text-primary">₹{vendorTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function VendorOrders() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-my-orders"],
    queryFn: fetchMyOrders,
  });

  const totalRevenue = (orders as any[]).reduce((acc: number, order: any) =>
    acc + (order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0), 0
  );
  const paidRevenue = (orders as any[]).filter((o) => o.paymentStatus === "paid").reduce((acc: number, order: any) =>
    acc + (order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0), 0
  );
  const activeOrders = (orders as any[]).filter((o) => ["pending", "confirmed", "processing", "shipped"].includes(o.status)).length;

  const filtered = (orders as any[]).filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || (orderStatusConfig[order.status]?.label === statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Management</p>
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight">My Orders</h2>
          <p className="text-muted-foreground text-sm mt-1">Orders that include your products</p>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Orders", value: (orders as any[]).length, icon: ShoppingBag, gradient: "from-blue-500/10 to-indigo-500/5 border-blue-500/15" },
              { label: "Active Orders", value: activeOrders, icon: Clock, gradient: "from-amber-500/10 to-orange-500/5 border-amber-500/15" },
              { label: "Revenue Earned", value: `₹${paidRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, gradient: "from-emerald-500/10 to-teal-500/5 border-emerald-500/15" },
              { label: "Total Pipeline", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, gradient: "from-violet-500/10 to-purple-500/5 border-violet-500/15" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative bg-gradient-to-br ${stat.gradient} border rounded-2xl p-5 overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{stat.label}</p>
                  <div className="p-2 bg-white/20 dark:bg-white/10 rounded-xl">
                    <stat.icon className="w-4 h-4 text-foreground/60" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <ArrowUpRight className="absolute bottom-4 right-4 w-4 h-4 text-foreground/15" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl h-10 bg-muted/40 border-border/40"
              />
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const count = f === "All"
                ? (orders as any[]).length
                : (orders as any[]).filter((o) => orderStatusConfig[o.status]?.label === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    statusFilter === f
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-border/30 hover:text-foreground hover:border-border/60"
                  }`}
                >
                  {f}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === f ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/30 p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 rounded-lg" />
                    <Skeleton className="h-3 w-28 rounded-lg" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive/70" />
            </div>
            <p className="font-semibold text-foreground">Couldn't load orders</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-5"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-primary/40" />
            </div>
            <div className="text-center max-w-xs">
              <p className="font-bold text-foreground text-xl mb-1">
                {search || statusFilter !== "All" ? "No matching orders" : "No orders yet"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {search || statusFilter !== "All"
                  ? "Try adjusting your search or filter."
                  : "When buyers purchase your products, their orders will appear here."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Orders list */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order: any, i: number) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
