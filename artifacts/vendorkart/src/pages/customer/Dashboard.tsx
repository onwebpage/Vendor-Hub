import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe, useListOrders, useGetCart, useGetWishlist } from "@workspace/api-client-react";
import {
  Package, ShoppingBag, Clock, Heart, ArrowRight,
  TrendingUp, ShoppingCart, User, Sparkles, ChevronRight,
  Star, Zap, BarChart3, MapPin
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

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

export default function CustomerDashboard() {
  const { data: user } = useGetMe();
  const { data: ordersData } = useListOrders({ limit: 5 });
  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  const firstName = user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  const stats = [
    {
      label: "Total Orders",
      value: ordersData?.total || 0,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      borderAccent: "border-l-blue-500",
      sub: "All time",
    },
    {
      label: "Pending Deliveries",
      value: ordersData?.orders.filter(o => o.status === "processing" || o.status === "shipped").length || 0,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      borderAccent: "border-l-amber-500",
      sub: "In transit",
    },
    {
      label: "Items in Cart",
      value: cart?.itemCount || 0,
      icon: ShoppingCart,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      borderAccent: "border-l-emerald-500",
      sub: "Ready to order",
    },
    {
      label: "Saved Items",
      value: (wishlist as any[])?.length || 0,
      icon: Heart,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      borderAccent: "border-l-rose-500",
      sub: "In wishlist",
    },
  ];

  const quickActions = [
    { icon: ShoppingBag, label: "Browse Products", href: "/products", color: "text-blue-500", bg: "bg-blue-500/10", desc: "12,000+ items" },
    { icon: ShoppingCart, label: "My Cart", href: "/customer-dashboard/cart", color: "text-emerald-500", bg: "bg-emerald-500/10", desc: `${cart?.itemCount || 0} items` },
    { icon: Heart, label: "Wishlist", href: "/customer-dashboard/wishlist", color: "text-rose-500", bg: "bg-rose-500/10", desc: `${(wishlist as any[])?.length || 0} saved` },
    { icon: Package, label: "My Orders", href: "/customer-dashboard/orders", color: "text-violet-500", bg: "bg-violet-500/10", desc: `${ordersData?.total || 0} orders` },
    { icon: User, label: "Profile", href: "/customer-dashboard/profile", color: "text-amber-500", bg: "bg-amber-500/10", desc: "Account settings" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Welcome Header ── */}
        <motion.div {...fadeIn} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{greeting}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{today}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                Welcome back, <span className="text-primary">{firstName}!</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                Here's your wholesale procurement overview.
              </p>
            </div>
            <Button className="rounded-xl h-11 px-6 shadow-md shadow-primary/20 gap-2 flex-shrink-0" asChild>
              <Link href="/products">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className={`bg-card rounded-2xl p-5 border border-l-4 ${stat.borderAccent} border-border/50 shadow-sm hover:shadow-md transition-all`}
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold font-display">{stat.value}</div>
              <div className="text-sm font-semibold text-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <motion.div {...fadeIn}>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="group bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/25 hover:shadow-md hover:bg-accent/30 transition-all cursor-pointer h-full">
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

        {/* ── Main Grid: Orders + CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <motion.div {...fadeIn} className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Recent Orders</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your latest wholesale purchases</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary gap-1.5 rounded-xl">
                <Link href="/customer-dashboard/orders">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-2.5">
                {ordersData.orders.map(order => (
                  <Link key={order.id} href={`/customer-dashboard/orders`}>
                    <div className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-accent/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm">#{order.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">{new Date(order.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-sm">₹{order.total.toLocaleString("en-IN")}</div>
                        </div>
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
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 opacity-30" />
                </div>
                <p className="font-medium">No orders placed yet</p>
                <p className="text-sm text-muted-foreground/60 mt-0.5">Start sourcing wholesale products below</p>
                <Button className="mt-4 rounded-xl gap-2" asChild>
                  <Link href="/products">Start Sourcing <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Right panel */}
          <motion.div {...fadeIn} className="flex flex-col gap-4">
            {/* Custom Quote CTA */}
            <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-primary-foreground flex-1">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, rgba(255,255,255,0.4), transparent 60%)" }} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Need bulk custom quotes?</h3>
                <p className="text-primary-foreground/75 mb-5 text-sm leading-relaxed">
                  Our team helps negotiate better rates with manufacturers for large orders.
                </p>
                <Button variant="secondary" className="w-full rounded-xl font-bold gap-2">
                  Request Custom Quote <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats summary card */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Activity Summary
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Orders Delivered", value: ordersData?.orders.filter(o => o.status === "delivered").length || 0, color: "text-emerald-500" },
                  { label: "In Transit", value: ordersData?.orders.filter(o => o.status === "shipped").length || 0, color: "text-blue-500" },
                  { label: "Pending", value: ordersData?.orders.filter(o => o.status === "processing" || o.status === "pending").length || 0, color: "text-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
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
