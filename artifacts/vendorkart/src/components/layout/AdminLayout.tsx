import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Store, Users, Package, ShoppingBag, Tags,
  CreditCard, FileText, Activity, Settings, LogOut, Menu, X,
  ShieldCheck, Bell, ChevronRight, BarChart3, MessageSquare,
  Crown, Percent, Image, Mail, Clock, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Store, label: "Vendors", href: "/admin/vendors" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Tags, label: "Categories", href: "/admin/categories" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: FileText, label: "Coupons", href: "/admin/coupons" },
  { icon: Crown, label: "Subscriptions", href: "/admin/subscriptions" },
  { icon: Clock, label: "Sub Payments", href: "/admin/subscription-payments" },
  { icon: Percent, label: "Commission", href: "/admin/commission" },
  { icon: Image, label: "Banners", href: "/admin/banners" },
  { icon: Phone, label: "Contact Info", href: "/admin/contact-info" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: MessageSquare, label: "Contact", href: "/admin/contact" },
  { icon: Activity, label: "Activity", href: "/admin/activity" },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAdminAuthStore();

  const handleLogout = () => {
    logout();
    setLocation("/admin-login");
  };

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  return (
    <div className="flex h-screen bg-[#080c14] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`flex-shrink-0 flex flex-col border-r border-white/6 bg-[#03050d] transition-all duration-300 ${collapsed ? "w-[68px]" : "w-60"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/6 min-h-[64px]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-none">Admin Portal</p>
              <p className="text-white/30 text-[10px] mt-0.5">Vendorkart</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-white/40 hover:text-white/70 hover:bg-white/4"
                }`}>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-indigo-400" : ""}`} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/6 p-2 space-y-0.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/4 transition-all"
          >
            {collapsed ? <Menu className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/6 bg-[#03050d]/80 backdrop-blur-md min-h-[64px] flex-shrink-0">
          <h1 className="text-white font-bold text-lg">{title || "Dashboard"}</h1>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl border border-white/8 bg-white/4 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/8 transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/8 bg-white/4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">A</div>
              <span className="text-white/60 text-xs font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
