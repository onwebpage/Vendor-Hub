import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe, useListOrders, useGetCart, useGetWishlist } from "@workspace/api-client-react";
import {
  Package, ShoppingBag, Clock, Heart, ArrowRight,
  ShoppingCart, Sparkles, ChevronRight,
  Zap, BarChart3, Layers, Cpu, Shirt, Wrench, Leaf, Gem
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getStatusStyle(status: string) {
  switch (status) {
    case "delivered": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    case "processing": return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    case "shipped": return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400";
    case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    default: return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  }
}

const CATEGORIES = [
  { label: "Electronics", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10", href: "/products?category=electronics" },
  { label: "Industrial", icon: Wrench, color: "text-slate-500", bg: "bg-slate-500/10", href: "/products?category=industrial" },
  { label: "Apparel", icon: Shirt, color: "text-rose-500", bg: "bg-rose-500/10", href: "/products?category=apparel" },
  { label: "Raw Materials", icon: Layers, color: "text-amber-500", bg: "bg-amber-500/10", href: "/products?category=raw-materials" },
  { label: "Agriculture", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/products?category=agriculture" },
  { label: "Luxury & Gifts", icon: Gem, color: "text-violet-500", bg: "bg-violet-500/10", href: "/products?category=luxury" },
];

export default function CustomerDashboard() {
  const { data: user } = useGetMe();
  const { data: ordersData } = useListOrders({ page: 1, limit: 5 } as any);
  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  const firstName = user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  const totalOrders = ordersData?.total || 0;
  const pendingDeliveries = ordersData?.orders.filter(o => o.status === "processing" || o.status === "shipped").length || 0;
  const cartItems = cart?.itemCount || 0;
  const savedItems = (wishlist as any[])?.length || 0;

  const delivered = ordersData?.orders.filter(o => o.status === "delivered").length || 0;
  const inTransit = ordersData?.orders.filter(o => o.status === "shipped").length || 0;
  const pending = ordersData?.orders.filter(o => o.status === "processing" || o.status === "pending").length || 0;
  const maxActivity = Math.max(delivered, inTransit, pending, 1);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-white/20",
      sub: "All time",
      href: "/customer-dashboard/orders",
    },
    {
      label: "In Transit",
      value: pendingDeliveries,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-white/20",
      sub: "Pending delivery",
      href: "/customer-dashboard/orders",
    },
    {
      label: "Cart Items",
      value: cartItems,
      icon: ShoppingCart,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-white/20",
      sub: "Ready to order",
      href: "/customer-dashboard/cart",
    },
    {
      label: "Saved Items",
      value: savedItems,
      icon: Heart,
      gradient: "from-rose-500 to-pink-500",
      iconBg: "bg-white/20",
      sub: "In wishlist",
      href: "/customer-dashboard/wishlist",
    },
  ];

  const quickActions = [
    { icon: ShoppingBag, label: "Browse Products", href: "/products", color: "text-blue-500", bg: "bg-blue-500/10", desc: "12,000+ items" },
    { icon: ShoppingCart, label: "My Cart", href: "/customer-dashboard/cart", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: `${cartItems} items` },
    { icon: Heart, label: "Wishlist", href: "/customer-dashboard/wishlist", color: "text-rose-500", bg: "bg-rose-500/10", desc: `${savedItems} saved` },
    { icon: Package, label: "My Orders", href: "/customer-dashboard/orders", color: "text-violet-500", bg: "bg-violet-500/10", desc: `${totalOrders} orders` },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* ── Welcome Banner ── */}
        <motion.div {...fadeIn} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-6 sm:p-8 text-primary-foreground">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 75% 20%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.06), transparent 50%)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{greeting} · {today}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                Welcome back, {firstName}!
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1.5">
                Your wholesale procurement hub — sourcing made simple.
              </p>
            </div>
            <Button
              className="bg-white text-primary hover:bg-white/90 rounded-xl h-11 px-6 gap-2 font-semibold flex-shrink-0 shadow-lg"
              asChild
            >
              <Link href="/products">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <Link href={stat.href}>
                <div className={`relative rounded-2xl p-5 bg-gradient-to-br ${stat.gradient} text-white overflow-hidden cursor-pointer hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
                  <div className="relative">
                    <div className={`p-2.5 rounded-xl ${stat.iconBg} w-fit mb-4`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold font-display">{stat.value}</div>
                    <div className="text-sm font-semibold text-white mt-1">{stat.label}</div>
                    <div className="text-xs text-white/65 mt-0.5">{stat.sub}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <motion.div {...fadeIn}>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="group bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/25 hover:shadow-md hover:bg-accent/20 transition-all cursor-pointer h-full flex flex-col">
                  <div className={`p-2.5 rounded-xl ${action.bg} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <p className="font-semibold text-sm leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Browse Categories ── */}
        <motion.div {...fadeIn}>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Browse by Category
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href={cat.href}>
                <div className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md hover:bg-accent/20 transition-all cursor-pointer text-center">
                  <div className={`p-2.5 rounded-xl ${cat.bg} group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <p className="text-xs font-semibold leading-tight">{cat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <motion.div {...fadeIn} className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-bold">Recent Orders</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your latest wholesale purchases</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary gap-1 rounded-xl text-xs">
                <Link href="/customer-dashboard/orders">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-2">
                {ordersData.orders.map(order => (
                  <Link key={order.id} href="/customer-dashboard/orders">
                    <div className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-accent/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm">#{order.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="font-bold text-sm">₹{order.total.toLocaleString("en-IN")}</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 opacity-25" />
                </div>
                <p className="font-semibold">No orders yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Start sourcing wholesale products below</p>
                <Button className="mt-5 rounded-xl gap-2" asChild>
                  <Link href="/products">Start Sourcing <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Right Panel */}
          <motion.div {...fadeIn} className="flex flex-col gap-4">
            {/* Promo Card */}
            <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-1">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.6), transparent 55%)" }} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold mb-2 leading-snug">Need bulk custom quotes?</h3>
                <p className="text-white/60 mb-5 text-sm leading-relaxed">
                  Negotiate better rates with manufacturers directly for large orders.
                </p>
                <Button className="w-full rounded-xl font-semibold gap-2 bg-white text-slate-900 hover:bg-white/90">
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Order Summary
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Delivered", value: delivered, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
                  { label: "In Transit", value: inTransit, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
                  { label: "Processing", value: pending, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                      <span className={`text-xs font-bold ${item.textColor}`}>{item.value}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${Math.round((item.value / maxActivity) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
