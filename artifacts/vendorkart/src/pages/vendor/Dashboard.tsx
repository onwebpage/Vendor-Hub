import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetVendorProfile } from "@workspace/api-client-react";
import {
  Store, Package, ShoppingBag, IndianRupee, Clock,
  Plus, Lock, ArrowRight, CheckCircle2, XCircle, Star, MapPin,
  AlertTriangle, Zap, BarChart3, Users, Shield, TrendingUp,
  Bell, ChevronRight, Sparkles, Building2, Phone, Mail, Link2, Copy, ExternalLink,
  CalendarDays, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { useVendorBase } from "@/lib/use-vendor-base";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

function StoreUrlBar({ slug }: { slug: string }) {
  const [copied, setCopied] = React.useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const storeUrl = `${window.location.origin}${base}/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-primary/5 border border-primary/15">
      <Link2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <span className="text-xs text-primary font-mono flex-1 truncate">{storeUrl}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary/15 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
        title="Copy store URL"
      >
        <Copy className="w-3 h-3" />
        {copied ? "Copied!" : "Copy"}
      </button>
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
        title="Open store in new tab"
      >
        <ExternalLink className="w-3 h-3" />
        Visit
      </a>
    </div>
  );
}

function StatusBanner({ status, rejectionReason, slug, dashboardBase }: { status: string; rejectionReason?: string | null; slug?: string; dashboardBase: string }) {
  if (status === "approved") {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const storeUrl = slug ? `${window.location.origin}${base}/${slug}` : null;
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-2.5 rounded-xl bg-emerald-500/15 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">Your store is live and verified</p>
          <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">Buyers can discover your store and products across the marketplace.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {storeUrl && (
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10">
                <ExternalLink className="w-3.5 h-3.5" /> View Store
              </Button>
            </a>
          )}
          <Link href={`${dashboardBase}/add-product`}>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl border-0 gap-1.5">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (status === "pending") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 p-6 mb-8">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-amber-700 dark:text-amber-400">Awaiting Admin Approval</h3>
            <p className="text-amber-700/75 dark:text-amber-400/75 text-sm mt-0.5 leading-relaxed">
              Your vendor account is being reviewed. Once approved, you can add products and your store will appear in the marketplace.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: 1, label: "Application Submitted", done: true },
            { step: 2, label: "Admin Review", done: false, active: true },
            { step: 3, label: "Store Activated", done: false },
          ].map((s) => (
            <div key={s.step} className={`flex items-center gap-2.5 rounded-xl p-3 border ${
              s.done ? "bg-emerald-500/10 border-emerald-500/20" :
              s.active ? "bg-amber-500/10 border-amber-500/25 animate-pulse" :
              "bg-white/5 border-border/30"
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                s.done ? "bg-emerald-500 text-white" :
                s.active ? "bg-amber-500 text-white" :
                "bg-muted text-muted-foreground"
              }`}>{s.done ? "✓" : s.step}</div>
              <span className={`text-xs font-medium leading-tight ${
                s.done ? "text-emerald-700 dark:text-emerald-400" :
                s.active ? "text-amber-700 dark:text-amber-400" :
                "text-muted-foreground"
              }`}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (status === "rejected") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-500/10 to-red-400/5 p-5 mb-8 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-red-500/15 flex-shrink-0">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Application Not Approved</h3>
          <p className="text-red-700/75 dark:text-red-400/75 text-sm mt-0.5">
            {rejectionReason || "Your vendor application was not approved. Please contact support for more information."}
          </p>
        </div>
      </motion.div>
    );
  }

  if (status === "suspended") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-orange-400/5 p-5 mb-8 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-orange-500/15 flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-orange-700 dark:text-orange-400">Account Suspended</h3>
          <p className="text-orange-700/75 dark:text-orange-400/75 text-sm mt-0.5">
            Your account has been suspended. Please contact our support team to resolve this.
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
}

function StatCard({
  label, value, icon: Icon, color, bg, subtext, locked
}: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; bg: string; subtext?: string; locked?: boolean;
}) {
  return (
    <motion.div
      {...fadeIn}
      className={`relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm overflow-hidden ${locked ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {locked && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-lg font-semibold uppercase tracking-wide">
            <Lock className="w-2.5 h-2.5" /> Locked
          </div>
        )}
      </div>
      <div className="text-3xl font-bold font-display tracking-tight">{value}</div>
      <div className="text-sm font-medium text-muted-foreground mt-1">{label}</div>
      {subtext && <div className="text-xs text-muted-foreground/60 mt-0.5">{subtext}</div>}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${bg} opacity-30`} />
    </motion.div>
  );
}

type AnalyticsData = {
  totalRevenue: number;
  vendorEarnings: number;
  pendingOrders: number;
  totalOrders: number;
  topProducts: Array<{ productId: number; name: string; quantity: number; revenue: number; image?: string }>;
  dailyRevenue: Array<{ date: string; label: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; label: string; revenue: number }>;
};

function useVendorAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["vendor-analytics"],
    queryFn: () => customFetch<AnalyticsData>("/api/vendors/analytics"),
    staleTime: 60_000,
  });
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function AnalyticsKpiCard({ label, value, icon: Icon, color, bg, sub }: {
  label: string; value: string; icon: React.ElementType; color: string; bg: string; sub?: string;
}) {
  return (
    <motion.div {...fadeIn} className={`relative bg-card rounded-2xl p-5 border border-border/50 shadow-sm overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
      <div className="text-sm font-medium text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/55 mt-0.5">{sub}</div>}
      <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full ${bg} opacity-25`} />
    </motion.div>
  );
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

function SmartDashboard({ isApproved }: { isApproved: boolean }) {
  const [chartMode, setChartMode] = useState<"daily" | "monthly">("monthly");
  const { data, isLoading } = useVendorAnalytics();

  if (!isApproved) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = chartMode === "daily" ? data.dailyRevenue : data.monthlyRevenue;
  const chartKey = chartMode === "daily" ? "label" : "label";
  const maxRevenue = Math.max(...data.topProducts.map(p => p.revenue), 1);

  const kpis = [
    { label: "Total Revenue", value: fmt(data.totalRevenue), icon: IndianRupee, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", sub: "Gross from all orders" },
    { label: "Vendor Earnings", value: fmt(data.vendorEarnings), icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", sub: "After 15% platform fee" },
    { label: "Pending Orders", value: String(data.pendingOrders), icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", sub: "Awaiting fulfilment" },
    { label: "Total Orders", value: String(data.totalOrders), icon: ShoppingBag, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", sub: "All-time order count" },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-bold">Smart Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <AnalyticsKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Revenue Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-sm">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {chartMode === "daily" ? "Last 30 days" : "Last 12 months"}
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 self-start sm:self-auto">
              <button
                onClick={() => setChartMode("daily")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMode === "daily" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <CalendarDays className="w-3 h-3" /> Daily
              </button>
              <button
                onClick={() => setChartMode("monthly")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMode === "monthly" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Calendar className="w-3 h-3" /> Monthly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={chartKey}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.4 }}
                tickLine={false}
                axisLine={false}
                interval={chartMode === "daily" ? 4 : 0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.4 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}
                formatter={(value: number) => [fmt(value), "Revenue"]}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", stroke: "hsl(var(--card))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-1">Top Products</h3>
          <p className="text-xs text-muted-foreground mb-4">By revenue earned</p>
          {data.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Package className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No sales data yet</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Start selling to see top products</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((product, i) => (
                <div key={product.productId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium truncate">{product.name}</span>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground ml-2 flex-shrink-0">{fmt(product.revenue)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(product.revenue / maxRevenue) * 100}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length]
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{product.quantity} units sold</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, href, disabled, color }: {
  icon: React.ElementType; label: string; href: string; disabled?: boolean; color: string;
}) {
  const content = (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
      disabled
        ? "border-border/30 bg-muted/30 opacity-50 cursor-not-allowed"
        : "border-border/50 bg-card hover:border-primary/25 hover:shadow-md hover:bg-accent/50 cursor-pointer"
    }`}>
      <div className={`p-2 rounded-xl ${color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-semibold flex-1">{label}</span>
      {!disabled && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
      {disabled && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
    </div>
  );

  if (disabled) return content;
  return <Link href={href}>{content}</Link>;
}

export default function VendorDashboard() {
  const { data: profile, isLoading } = useGetVendorProfile();
  const { base: dashboardBase } = useVendorBase();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-2">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48 rounded-xl" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isApproved = profile?.status === "approved";
  const isPending = profile?.status === "pending";
  const rating = profile?.rating ? parseFloat(String(profile.rating)) : 0;

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${Number(profile?.totalSales || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      subtext: "Lifetime earnings",
      locked: !isApproved,
    },
    {
      label: "Products Listed",
      value: profile?.productCount ?? 0,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      subtext: "Active in marketplace",
      locked: !isApproved,
    },
    {
      label: "Pending Orders",
      value: isApproved ? 0 : "—",
      icon: ShoppingBag,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      subtext: "Awaiting fulfillment",
      locked: !isApproved,
    },
    {
      label: "Store Rating",
      value: isApproved ? (parseFloat(String(rating)) > 0 ? `${parseFloat(String(rating)).toFixed(1)} ★` : "New") : "—",
      icon: Star,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      subtext: `${profile?.reviewCount ?? 0} reviews`,
      locked: !isApproved,
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Add New Product", href: `${dashboardBase}/add-product`, color: "bg-primary/10 text-primary", disabled: !isApproved },
    { icon: Package, label: "Manage Products", href: `${dashboardBase}/products`, color: "bg-blue-500/10 text-blue-500", disabled: !isApproved },
    { icon: ShoppingBag, label: "View Orders", href: `${dashboardBase}/orders`, color: "bg-violet-500/10 text-violet-500", disabled: !isApproved },
    { icon: Store, label: "Store Settings", href: `${dashboardBase}/store-settings`, color: "bg-slate-500/10 text-slate-500", disabled: false },
  ];

  const initials = (profile?.businessName || "?")
    .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">{profile?.businessName || "My Store"}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isApproved ? "Manage your store, products, and incoming orders." : "Complete your setup — approval needed to go live."}
            </p>
          </div>
          {isApproved ? (
            <Button className="rounded-xl h-11 px-6 shadow-md shadow-primary/20 gap-2" asChild>
              <Link href={`${dashboardBase}/add-product`}>
                <Plus className="w-4 h-4" /> Add Product
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold">
              <Clock className="w-4 h-4" />
              {isPending ? "Pending Approval" : profile?.status === "rejected" ? "Not Approved" : "Suspended"}
            </div>
          )}
        </motion.div>

        {/* Status Banner */}
        <StatusBanner status={profile?.status ?? "pending"} rejectionReason={profile?.rejectionReason} slug={(profile as any)?.slug} dashboardBase={dashboardBase} />

        {/* Store Profile Card */}
        <motion.div {...fadeIn} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          {/* Banner */}
          <div className="h-36 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/10">
            {profile?.banner ? (
              <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "radial-gradient(circle at 20% 60%, rgba(99,102,241,0.6), transparent 50%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.5), transparent 50%)"
              }} />
            )}
            {/* Status pill over banner */}
            <div className={`absolute top-4 right-4 text-[11px] font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm capitalize ${
              isApproved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" :
              isPending ? "bg-amber-500/20 border-amber-500/30 text-amber-300" :
              "bg-red-500/20 border-red-500/30 text-red-300"
            }`}>
              {profile?.status ?? "pending"}
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Logo */}
            <div className="flex justify-between items-end -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {profile?.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-extrabold text-primary">{initials}</span>
                )}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                <Link href={`${dashboardBase}/store-settings`}>
                  <Store className="w-3.5 h-3.5" /> Edit Store
                </Link>
              </Button>
            </div>

            {/* Business name + info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold leading-tight">{profile?.businessName || "Your Business"}</h2>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                  {profile?.subscriptionPlan ?? "basic"} plan
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {(profile?.city || profile?.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {profile?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                    {profile.email}
                  </span>
                )}
                {profile?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                    {profile.phone}
                  </span>
                )}
                {profile?.gstNumber && (
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">GST: {profile.gstNumber}</span>
                  </span>
                )}
              </div>

              {profile?.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{profile.description}</p>
              )}

              {/* Store URL */}
              {(profile as any)?.slug && (
                <StoreUrlBar slug={(profile as any).slug} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Smart Dashboard Analytics */}
        <SmartDashboard isApproved={isApproved} />

        {/* Quick Actions + Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickAction key={action.label} {...action} />
              ))}
            </div>
          </div>

          {/* Tips / Info Card */}
          <div>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isApproved ? "Grow Your Store" : "What's Next?"}
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
              {isApproved ? (
                <>
                  {[
                    { icon: BarChart3, text: "Add bulk pricing tiers to attract wholesale buyers" },
                    { icon: Package, text: "List at least 10 products to boost discovery" },
                    { icon: Users, text: "Complete your GST details to build buyer trust" },
                    { icon: Star, text: "Respond to orders quickly to improve your rating" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                        <tip.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{tip.text}</p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { icon: Clock, text: "Admin reviews typically take 24–48 hours" },
                    { icon: Shield, text: "Ensure your GST and business documents are ready" },
                    { icon: Building2, text: "Complete your store profile for faster approval" },
                    { icon: Bell, text: "You'll be notified by email once approved" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 flex-shrink-0 mt-0.5">
                        <tip.icon className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-snug">{tip.text}</p>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/50">
                    <Link href={`${dashboardBase}/store-settings`}>
                      <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs">
                        Complete Store Profile <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
