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
  const itemRows = (order.items || []).map((i: any) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${i.productName || "Product"}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${fmt(i.price)}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700">${fmt(i.subtotal || i.price * i.quantity)}</td></tr>`
  ).join("");
  const addr = order.shippingAddress;
  const addrStr = addr ? `${addr.name ? addr.name + "<br>" : ""}${addr.addressLine1}<br>${addr.city}, ${addr.state} — ${addr.pincode}` : "—";
  const subtotal = Number(order.subtotal || 0);
  const disc = Number(order.discount || 0);
  const total = Number(order.total || 0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice – ${order.orderNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f6fa;padding:32px;color:#1a1a2e}@media print{body{background:#fff;padding:0}}.card{max-width:760px;margin:auto;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.10);overflow:hidden}.header{background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 44px;color:#fff;display:flex;justify-content:space-between;align-items:flex-start}.brand h1{font-size:26px;font-weight:800;letter-spacing:-0.5px}.brand p{font-size:13px;opacity:.75;margin-top:3px}.inv-info{text-align:right}.inv-info .num{font-size:18px;font-weight:700}.inv-info p{font-size:12px;opacity:.75;margin-top:2px}.body{padding:36px 44px}.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:32px}.meta-blk h3{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:6px}.meta-blk p{font-size:13px;font-weight:600;color:#111;line-height:1.6}.table-wrap{border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:28px}table{width:100%;border-collapse:collapse}thead{background:#f9fafb}thead th{padding:10px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#6b7280;text-align:left}thead th:nth-child(n+2){text-align:center}thead th:last-child{text-align:right}.sum{display:flex;flex-direction:column;align-items:flex-end;gap:6px}.sum-row{display:flex;justify-content:space-between;width:260px;font-size:13px;color:#374151;padding:3px 0}.sum-row.coupon{color:#059669}.sum-row.grand{border-top:2px solid #e5e7eb;margin-top:6px;padding-top:10px;font-size:16px;font-weight:800;color:#1a1a2e}.badge{display:inline-flex;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700}.paid{background:#d1fae5;color:#065f46}.pending{background:#fef3c7;color:#92400e}.footer{text-align:center;padding:20px 44px;background:#f9fafb;border-top:1px solid #f0f0f0;font-size:11px;color:#9ca3af}</style></head><body><div class="card"><div class="header"><div class="brand"><h1>Vendorkart</h1><p>India's #1 B2B Wholesale Marketplace</p></div><div class="inv-info"><div class="num">INV-${order.orderNumber}</div><p>Date: ${new Date(order.createdAt || "").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p><p>Order: #${order.orderNumber}</p></div></div><div class="body"><div class="meta"><div class="meta-blk"><h3>Bill To</h3><p>${addrStr}</p></div><div class="meta-blk"><h3>Payment</h3><span class="badge ${order.paymentStatus === "paid" ? "paid" : "pending"}">${(order.paymentStatus || "Pending").toUpperCase()}</span>${order.couponCode ? `<p style="margin-top:8px;font-size:11px;color:#6b7280">Coupon: <strong>${order.couponCode}</strong></p>` : ""}</div><div class="meta-blk"><h3>Order Status</h3><p>${(order.status || "").replace(/_/g," ").toUpperCase()}</p></div></div><div class="table-wrap"><table><thead><tr><th>Product</th><th>Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table></div><div class="sum"><div class="sum-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>${disc > 0 ? `<div class="sum-row coupon"><span>Discount${order.couponCode ? " (" + order.couponCode + ")" : ""}</span><span>- ${fmt(disc)}</span></div>` : ""}<div class="sum-row grand"><span>Total Amount</span><span>${fmt(total)}</span></div></div></div><div class="footer"><p>Thank you for your order! · Vendorkart · support@vendorkart.in · All prices inclusive of applicable taxes.</p></div></div><script>window.onload=function(){window.print()}</script></body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
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
