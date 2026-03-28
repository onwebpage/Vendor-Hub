import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useGetVendorProfile } from "@workspace/api-client-react";
import {
  IndianRupee, TrendingUp, Package, ShoppingBag, CheckCircle2, Clock,
  AlertCircle, BarChart3, ArrowUpRight, CreditCard,
} from "lucide-react";
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

const paymentBadge: Record<string, string> = {
  paid: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  pending: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  failed: "text-red-600 bg-red-500/10 border-red-500/20",
  refunded: "text-muted-foreground bg-muted border-border",
};

export default function VendorPayments() {
  const { data: profile } = useGetVendorProfile();
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-my-orders"],
    queryFn: fetchMyOrders,
  });

  const paidOrders = (orders as any[]).filter((o) => o.paymentStatus === "paid");
  const pendingOrders = (orders as any[]).filter((o) => o.paymentStatus === "pending");

  const totalEarned = paidOrders.reduce((acc: number, order: any) =>
    acc + (order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0), 0
  );
  const pendingRevenue = pendingOrders.reduce((acc: number, order: any) =>
    acc + (order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0), 0
  );

  const monthlyData: Record<string, number> = {};
  paidOrders.forEach((order: any) => {
    const month = new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const amount = order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0;
    monthlyData[month] = (monthlyData[month] ?? 0) + amount;
  });
  const monthlyEntries = Object.entries(monthlyData).slice(-6);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display">Payments</h2>
          <p className="text-muted-foreground text-sm mt-1">Your earnings and payment history</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earned",
              value: `₹${totalEarned.toLocaleString("en-IN")}`,
              icon: IndianRupee,
              color: "from-emerald-500/15 to-emerald-400/5 border-emerald-500/20",
              iconClass: "text-emerald-600 bg-emerald-500/15",
            },
            {
              label: "Pending Revenue",
              value: `₹${pendingRevenue.toLocaleString("en-IN")}`,
              icon: Clock,
              color: "from-amber-500/15 to-amber-400/5 border-amber-500/20",
              iconClass: "text-amber-600 bg-amber-500/15",
            },
            {
              label: "Paid Orders",
              value: paidOrders.length,
              icon: CheckCircle2,
              color: "from-blue-500/15 to-blue-400/5 border-blue-500/20",
              iconClass: "text-blue-600 bg-blue-500/15",
            },
            {
              label: "Total Orders",
              value: (orders as any[]).length,
              icon: ShoppingBag,
              color: "from-violet-500/15 to-violet-400/5 border-violet-500/20",
              iconClass: "text-violet-600 bg-violet-500/15",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconClass}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {monthlyEntries.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Monthly Earnings</h3>
            </div>
            <div className="flex items-end gap-3 h-32">
              {monthlyEntries.map(([month, amount]) => {
                const max = Math.max(...monthlyEntries.map(([, v]) => v));
                const pct = max > 0 ? (amount / max) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <p className="text-xs font-semibold text-primary">₹{amount > 999 ? `${(amount / 1000).toFixed(1)}k` : amount}</p>
                    <div className="w-full bg-muted rounded-t-lg overflow-hidden" style={{ height: "80px" }}>
                      <div
                        className="w-full bg-primary/70 rounded-t-lg transition-all duration-500"
                        style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{month}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/40 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Payment History</h3>
          </div>

          {isLoading && (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <AlertCircle className="w-5 h-5 text-destructive/60" />
              <p>Failed to load payment history.</p>
            </div>
          )}

          {!isLoading && !isError && (orders as any[]).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <IndianRupee className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm">No payment records yet. Start selling to see earnings here.</p>
            </div>
          )}

          {!isLoading && !isError && (orders as any[]).length > 0 && (
            <div className="divide-y divide-border/40">
              {(orders as any[]).map((order: any) => {
                const amount = order.vendorItems?.reduce((s: number, item: any) => s + item.subtotal, 0) ?? 0;
                return (
                  <div key={order.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <IndianRupee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Order #{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{order.vendorItems?.length ?? 0} item{(order.vendorItems?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${paymentBadge[order.paymentStatus] ?? paymentBadge.pending}`}>
                        {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "pending" ? "Pending" : order.paymentStatus}
                      </span>
                      <p className={`font-bold text-sm ${order.paymentStatus === "paid" ? "text-emerald-600" : "text-foreground"}`}>
                        ₹{amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
