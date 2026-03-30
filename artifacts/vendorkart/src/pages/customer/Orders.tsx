import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListOrders } from "@workspace/api-client-react";
import {
  Package, Clock, CheckCircle2, XCircle, Truck, ChevronDown,
  ChevronUp, Download, MapPin, Calendar, Hash, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type TabType = "all" | "active" | "completed" | "cancelled";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; tab: TabType }> = {
  pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   icon: Clock,         tab: "active"    },
  confirmed:  { label: "Confirmed",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       icon: CheckCircle2,  tab: "active"    },
  processing: { label: "Processing", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400", icon: Package,     tab: "active"    },
  shipped:    { label: "Shipped",    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",        icon: Truck,         tab: "active"    },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",   icon: CheckCircle2,  tab: "completed" },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           icon: XCircle,       tab: "cancelled" },
};

const TRACKING_STEPS = ["confirmed", "processing", "shipped", "delivered"];

function TrackingBar({ status }: { status: string }) {
  const idx = TRACKING_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {TRACKING_STEPS.map((step, i) => {
        const done = i <= idx;
        const S = STATUS_CONFIG[step];
        return (
          <React.Fragment key={step}>
            <div className={`flex flex-col items-center gap-1 ${done ? "text-primary" : "text-muted-foreground/40"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${done ? "border-primary bg-primary text-white" : "border-muted-foreground/20 bg-muted"}`}>
                <S.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold capitalize hidden sm:block">{step}</span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded transition-all ${i < idx ? "bg-primary" : "bg-muted-foreground/20"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function handleDownloadInvoice(order: any) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const items = (order.items || []).map((i: any) =>
    `  ${i.productName} × ${i.quantity} @ ${fmt(i.price)} = ${fmt(i.subtotal)}`
  ).join("\n");

  const content = [
    "=".repeat(54),
    `       VENDORKART — TAX INVOICE`,
    "=".repeat(54),
    `Invoice No  : INV-${order.orderNumber}`,
    `Date        : ${new Date(order.createdAt || "").toLocaleDateString("en-IN")}`,
    `Order No    : ${order.orderNumber}`,
    "-".repeat(54),
    "ITEMS:",
    items,
    "-".repeat(54),
    `Subtotal    : ${fmt(order.subtotal)}`,
    `Discount    : - ${fmt(order.discount || 0)}`,
    `TOTAL       : ${fmt(order.total)}`,
    "-".repeat(54),
    `Payment     : ${order.paymentStatus?.toUpperCase()}`,
    `Status      : ${order.status?.toUpperCase()}`,
    "=".repeat(54),
    "Thank you for your business!",
    "Vendorkart — India's #1 B2B Marketplace",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${order.orderNumber}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const isActive = ["pending", "confirmed", "processing", "shipped"].includes(order.status);

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm font-mono">#{order.orderNumber}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                  <Icon className="w-3 h-3" />{cfg.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{(order.items || []).length} item(s)</span>
                {order.transactionId && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" />Paid</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <span className="font-bold text-lg">{fmt(order.total)}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs gap-1" onClick={() => handleDownloadInvoice(order)}>
                <Download className="w-3 h-3" />Invoice
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl h-8 text-xs gap-1" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}Details
              </Button>
            </div>
          </div>
        </div>

        {/* Tracking bar for active orders */}
        {isActive && order.status !== "pending" && <TrackingBar status={order.status} />}
      </div>

      {expanded && (
        <div className="border-t border-border/50 bg-muted/20 p-5 sm:p-6 space-y-4">
          {/* Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Order Items</h4>
            <div className="space-y-2">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.vendorName} · Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Shipping Address</h4>
              <div className="flex gap-2 text-sm text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>
                  {order.shippingAddress.name && <>{order.shippingAddress.name}, </>}
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </span>
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-background rounded-xl border border-border/50 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">- {fmt(order.discount || 0)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-border/50 pt-2 mt-2"><span>Total</span><span>{fmt(order.total)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerOrders() {
  const [tab, setTab] = useState<TabType>("all");
  const { data, isLoading } = useListOrders({});

  const orders = data?.orders || [];
  const filtered = tab === "all" ? orders : orders.filter(o => STATUS_CONFIG[o.status]?.tab === tab);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "all",       label: "All Orders",    count: orders.length },
    { key: "active",    label: "Active",        count: orders.filter(o => STATUS_CONFIG[o.status]?.tab === "active").length },
    { key: "completed", label: "Completed",     count: orders.filter(o => STATUS_CONFIG[o.status]?.tab === "completed").length },
    { key: "cancelled", label: "Cancelled",     count: orders.filter(o => STATUS_CONFIG[o.status]?.tab === "cancelled").length },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track all your bulk orders and download invoices.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border hover:bg-secondary/60"}`}
          >
            {t.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-bold mb-2">No {tab === "all" ? "" : tab} orders</h3>
          <p className="text-muted-foreground mb-6">Your orders will appear here once placed.</p>
          <Button asChild className="rounded-xl"><a href="/products">Browse Products</a></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </DashboardLayout>
  );
}
