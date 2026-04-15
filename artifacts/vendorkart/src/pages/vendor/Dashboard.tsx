import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetVendorProfile } from "@workspace/api-client-react";
import {
  Store, Package, ShoppingBag, IndianRupee, Clock,
  Plus, Lock, ArrowRight, CheckCircle2, XCircle, Star,
  AlertTriangle, Zap, BarChart3, Users, Shield, TrendingUp,
  Bell, ChevronRight, Sparkles, Building2, Phone, Mail, Link2, Copy, ExternalLink,
  CalendarDays, Calendar, MapPin, Edit3
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
    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-white/10 border border-white/15">
      <Link2 className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
      <span className="text-xs text-white/70 font-mono flex-1 truncate">{storeUrl}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:bg-white/15 px-2 py-1 rounded-md transition-colors flex-shrink-0"
      >
        <Copy className="w-3 h-3" />
        {copied ? "Copied!" : "Copy"}
      </button>
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/15 px-2 py-1 rounded-md transition-colors flex-shrink-0"
      >
        <ExternalLink className="w-3 h-3" />
        Visit
      </a>
    </div>
  );
}

function StatusBanner({ status, rejectionReason, slug, dashboardBase }: {
  status: string; rejectionReason?: string | null; slug?: string; dashboardBase: string;
}) {
  if (status === "pending") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/15 flex-shrink-0 w-fit">
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-700 dark:text-amber-400">Awaiting Admin Approval</h3>
          <p className="text-amber-700/75 dark:text-amber-400/75 text-sm mt-0.5">
            Your store is under review. We typically respond within 24–48 hours.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`${dashboardBase}/store-settings`}>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 border-amber-400/30 text-amber-700 hover:bg-amber-500/10 text-xs">
              Complete Profile <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }
  if (status === "rejected") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-red-400/30 bg-gradient-to-r from-red-500/10 to-red-400/5 p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-red-500/15 flex-shrink-0">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-red-700 dark:text-red-400">Application Not Approved</h3>
          <p className="text-red-700/75 dark:text-red-400/75 text-sm mt-0.5">
            {rejectionReason || "Your vendor application was not approved. Please contact support for more information."}
          </p>
        </div>
      </motion.div>
    );
  }
  if (status === "suspended") {
    return (
      <motion.div {...fadeIn} className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-orange-400/5 p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-orange-500/15 flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-orange-700 dark:text-orange-400">Account Suspended</h3>
          <p className="text-orange-700/75 dark:text-orange-400/75 text-sm mt-0.5">
            Your account has been suspended. Please contact our support team to resolve this.
          </p>
        </div>
      </motion.div>
    );
  }
  return null;
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
  const maxRevenue = Math.max(...data.topProducts.map(p => p.revenue), 1);

  const kpis = [
    { label: "Total Revenue", value: fmt(data.totalRevenue), gradient: "from-emerald-500 to-teal-500", icon: IndianRupee, sub: "Gross earnings" },
    { label: "Vendor Earnings", value: fmt(data.vendorEarnings), gradient: "from-blue-500 to-cyan-500", icon: TrendingUp, sub: "After platform fee" },
    { label: "Pending Orders", value: String(data.pendingOrders), gradient: "from-amber-500 to-orange-500", icon: Clock, sub: "Need fulfillment" },
    { label: "Total Orders", value: String(data.totalOrders), gradient: "from-violet-500 to-purple-600", icon: ShoppingBag, sub: "All-time count" },
  ];

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-bold">Analytics</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            {...fadeIn}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={`relative rounded-2xl p-5 bg-gradient-to-br ${kpi.gradient} text-white overflow-hidden`}
          >
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="p-2 rounded-xl bg-white/20 w-fit mb-3">
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold font-display tracking-tight">{kpi.value}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{kpi.label}</div>
              <div className="text-xs text-white/65 mt-0.5">{kpi.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                dataKey="label"
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
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
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
                      style={{ width: `${(product.revenue / maxRevenue) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
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

const quickActionDescs: Record<string, string> = {
  "Add New Product": "Grow your catalog",
  "Manage Products": "Edit & update listings",
  "View Orders": "Track & fulfil orders",
  "Store Settings": "Profile & branding",
};

function QuickAction({ icon: Icon, label, href, disabled, color }: {
  icon: React.ElementType; label: string; href: string; disabled?: boolean; color: string;
}) {
  const desc = quickActionDescs[label] || "";
  const content = (
    <div className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
      disabled
        ? "border-border/30 bg-muted/20 opacity-50 cursor-not-allowed"
        : "border-border/50 bg-card hover:border-primary/20 hover:shadow-md hover:bg-accent/40 cursor-pointer"
    }`}>
      <div className={`p-2.5 rounded-xl ${color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-bold block">{label}</span>
        {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
      </div>
      {!disabled && <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />}
      {disabled && <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />}
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
          <Skeleton className="h-36 w-full rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const isApproved = profile?.status === "approved";
  const isPending = profile?.status === "pending";
  const rating = profile?.rating ? parseFloat(String(profile.rating)) : 0;

  const quickActions = [
    { icon: Plus, label: "Add New Product", href: `${dashboardBase}/add-product`, color: "bg-primary/10 text-primary", disabled: !isApproved },
    { icon: Package, label: "Manage Products", href: `${dashboardBase}/products`, color: "bg-blue-500/10 text-blue-500", disabled: !isApproved },
    { icon: ShoppingBag, label: "View Orders", href: `${dashboardBase}/orders`, color: "bg-violet-500/10 text-violet-500", disabled: !isApproved },
    { icon: Store, label: "Store Settings", href: `${dashboardBase}/store-settings`, color: "bg-slate-500/10 text-slate-500", disabled: false },
  ];

  const initials = (profile?.businessName || "?")
    .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  const slug = (profile as any)?.slug;

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* ── Hero Store Card ── */}
        <motion.div {...fadeIn} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(circle at 10% 80%, rgba(6,182,212,0.2), transparent 50%)"
          }} />
          {profile?.banner && (
            <img src={profile.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity" />
          )}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/20 shadow-xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
              {profile?.logo ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-white">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">{profile?.businessName || "My Store"}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                  isApproved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" :
                  isPending ? "bg-amber-500/20 border-amber-500/30 text-amber-300" :
                  "bg-red-500/20 border-red-500/30 text-red-300"
                }`}>
                  {profile?.status ?? "pending"}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 capitalize">
                  {profile?.subscriptionPlan ?? "basic"} plan
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60 mb-2">
                {(profile?.city || profile?.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {profile?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {profile.email}
                  </span>
                )}
                {profile?.gstNumber && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    GST: {profile.gstNumber}
                  </span>
                )}
              </div>
              {slug && <StoreUrlBar slug={slug} />}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-white/20 text-white hover:bg-white/10 bg-transparent text-xs" asChild>
                <Link href={`${dashboardBase}/store-settings`}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Store
                </Link>
              </Button>
              {isApproved && (
                <Button size="sm" className="rounded-xl gap-1.5 bg-white text-slate-900 hover:bg-white/90 text-xs font-semibold" asChild>
                  <Link href={`${dashboardBase}/add-product`}>
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Status Banner (pending/rejected/suspended) ── */}
        {!isApproved && (
          <StatusBanner
            status={profile?.status ?? "pending"}
            rejectionReason={profile?.rejectionReason}
            slug={slug}
            dashboardBase={dashboardBase}
          />
        )}

        {/* ── Pending Stats Grid ── */}
        {!isApproved && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: "—", gradient: "from-emerald-500 to-teal-500", icon: IndianRupee, sub: "Locked until approval" },
              { label: "Products Listed", value: String(profile?.productCount ?? 0), gradient: "from-blue-500 to-cyan-500", icon: Package, sub: "In your catalog" },
              { label: "Pending Orders", value: "—", gradient: "from-amber-500 to-orange-500", icon: ShoppingBag, sub: "Locked until approval" },
              { label: "Store Rating", value: "—", gradient: "from-violet-500 to-purple-600", icon: Star, sub: "No reviews yet" },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className={`relative rounded-2xl p-5 bg-gradient-to-br ${s.gradient} text-white overflow-hidden opacity-50`}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="p-2 rounded-xl bg-white/20 w-fit mb-3">
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold font-display">{s.value}</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{s.label}</div>
                  <div className="text-xs text-white/65 mt-0.5">{s.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Smart Analytics (approved only) ── */}
        <SmartDashboard isApproved={isApproved} />

        {/* ── Quick Actions + Tips ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickAction key={action.label} {...action} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
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
