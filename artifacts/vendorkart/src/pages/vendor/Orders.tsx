import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, AlertCircle, Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchMyOrders() {
  const token = localStorage.getItem("vendorkart_token");
  const res = await fetch(`${API}/api/vendors/my-orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

const orderStatusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
  processing: { label: "Processing", icon: Package, color: "text-violet-600 bg-violet-500/10 border-violet-500/20" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-500/10 border-red-500/20" },
  refunded: { label: "Refunded", icon: RotateCcw, color: "text-muted-foreground bg-muted border-border" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Unpaid", color: "text-amber-600 bg-amber-500/10" },
  paid: { label: "Paid", color: "text-emerald-600 bg-emerald-500/10" },
  failed: { label: "Failed", color: "text-red-600 bg-red-500/10" },
  refunded: { label: "Refunded", color: "text-muted-foreground bg-muted" },
};

function OrderRow({ order }: { order: any }) {
  const [expanded, setExpanded] = React.useState(false);
  const status = orderStatusConfig[order.status] || orderStatusConfig.pending;
  const payment = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
  const StatusIcon = status.icon;
  const vendorItemsTotal = order.vendorItems?.reduce((acc: number, item: any) => acc + item.subtotal, 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2.5 bg-primary/10 rounded-xl flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">#{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
            <StatusIcon className="w-3 h-3" /> {status.label}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${payment.color}`}>
            {payment.label}
          </span>
          <p className="font-bold text-sm text-primary min-w-[80px] text-right">
            ₹{vendorItemsTotal.toLocaleString("en-IN")}
          </p>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-5 pb-5 pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Items in This Order</p>
          {order.vendorItems?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 bg-muted/30 rounded-xl p-3">
              {item.productImage ? (
                <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                </p>
              </div>
              <p className="font-bold text-sm text-primary flex-shrink-0">
                ₹{Number(item.subtotal).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
          {order.shippingAddress && (
            <div className="mt-3 p-3 rounded-xl border border-border/40 bg-muted/20">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Ship to</p>
              <p className="text-sm font-medium">{order.shippingAddress.name}</p>
              <p className="text-xs text-muted-foreground">
                {[order.shippingAddress.addressLine1, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function VendorOrders() {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-my-orders"],
    queryFn: fetchMyOrders,
  });

  const totalRevenue = orders.reduce((acc: number, order: any) =>
    acc + (order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0), 0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display">Orders</h2>
          <p className="text-muted-foreground text-sm mt-1">Orders containing your products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-primary bg-primary/10" },
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
            { label: "Pending Orders", value: orders.filter((o: any) => o.status === "pending" || o.status === "confirmed").length, icon: Clock, color: "text-amber-600 bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border/50 rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color} flex-shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="w-10 h-10 text-destructive/60" />
            <p>Failed to load orders.</p>
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
            <div className="p-5 bg-muted/40 rounded-full">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">No orders yet</p>
              <p className="text-sm mt-1">Orders for your products will appear here once customers start buying.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
