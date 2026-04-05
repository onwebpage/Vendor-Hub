import { Link } from "wouter";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp, Users, Shield, Package, Star, Building2, Zap, Globe, BarChart3, Lock, HeadphonesIcon, Sparkles, ShieldCheck, IndianRupee, Activity, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

const testimonialMeta = [
  { name: "Rajesh Mehta", role: "CEO, MegaSupply Pvt Ltd", avatar: "RM", rating: 5, color: "from-blue-500 to-indigo-600" },
  { name: "Priya Sharma", role: "Procurement Head, FashionHub", avatar: "PS", rating: 5, color: "from-violet-500 to-purple-600" },
  { name: "Anil Gupta", role: "Founder, AgriTech Solutions", avatar: "AG", rating: 5, color: "from-emerald-500 to-teal-600" },
  { name: "Sunita Patel", role: "Director, MedEquip Traders", avatar: "SP", rating: 5, color: "from-rose-500 to-pink-600" },
  { name: "Deepak Verma", role: "MD, TechParts Industries", avatar: "DV", rating: 5, color: "from-amber-500 to-orange-600" },
  { name: "Kavitha Nair", role: "Supply Chain Manager", avatar: "KN", rating: 5, color: "from-cyan-500 to-sky-600" },
  { name: "Mohammed Iqbal", role: "Owner, ElectroBulk", avatar: "MI", rating: 5, color: "from-indigo-500 to-blue-600" },
  { name: "Lakshmi Iyer", role: "Buyer, AutoParts Direct", avatar: "LI", rating: 5, color: "from-teal-500 to-green-600" },
];

const categoriesMeta = [
  { key: "Electronics & Tech", emoji: "💻", count: "2,400+", gradient: "from-blue-600/20 to-indigo-600/20", border: "border-blue-500/20", glow: "group-hover:shadow-blue-500/10", tag: "mostPopular" as const },
  { key: "Industrial Machinery", emoji: "⚙️", count: "1,800+", gradient: "from-slate-600/20 to-zinc-600/20", border: "border-slate-500/20", glow: "group-hover:shadow-slate-500/10" },
  { key: "Fashion & Apparel", emoji: "👗", count: "3,200+", gradient: "from-violet-600/20 to-pink-600/20", border: "border-violet-500/20", glow: "group-hover:shadow-violet-500/10", tag: "topSeller" as const },
  { key: "Agriculture & Farm", emoji: "🌾", count: "900+", gradient: "from-green-600/20 to-emerald-600/20", border: "border-green-500/20", glow: "group-hover:shadow-green-500/10" },
  { key: "Medical & Pharma", emoji: "🏥", count: "600+", gradient: "from-red-600/20 to-rose-600/20", border: "border-red-500/20", glow: "group-hover:shadow-red-500/10" },
  { key: "Home & Decor", emoji: "🏠", count: "1,500+", gradient: "from-amber-600/20 to-orange-600/20", border: "border-amber-500/20", glow: "group-hover:shadow-amber-500/10" },
  { key: "Automotive Parts", emoji: "🚗", count: "1,100+", gradient: "from-zinc-600/20 to-slate-600/20", border: "border-zinc-500/20", glow: "group-hover:shadow-zinc-500/10" },
  { key: "Food & Beverages", emoji: "🍱", count: "750+", gradient: "from-lime-600/20 to-green-600/20", border: "border-lime-500/20", glow: "group-hover:shadow-lime-500/10" },
];

const smallCardsMeta = [
  { icon: Globe, gradient: "from-violet-500 to-purple-600", bg: "from-violet-600/10 to-purple-600/5", border: "border-violet-500/15 hover:border-violet-500/30" },
  { icon: Zap, gradient: "from-amber-500 to-orange-500", bg: "from-amber-600/10 to-orange-600/5", border: "border-amber-500/15 hover:border-amber-500/30" },
  { icon: BarChart3, gradient: "from-rose-500 to-pink-600", bg: "from-rose-600/10 to-pink-600/5", border: "border-rose-500/15 hover:border-rose-500/30" },
];

export default function Home() {
  const { data: productData, isLoading } = useListProducts({ limit: 8 });
  const { t, language } = useLanguage();

  const statsData = [
    { value: "12,000+", label: t.stats.vendors },
    { value: "2.4L+", label: t.stats.buyers },
    { value: "₹850Cr+", label: t.stats.tradeVolume },
    { value: "98.4%", label: t.stats.satisfaction },
  ];

  const dashboardMetrics = [
    { label: t.dashboard.activeOrders, value: "3,842", change: "+12%", color: "#60a5fa", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.15)" },
    { label: t.dashboard.tradeVolume, value: "₹850Cr+", change: "+28%", color: "#a78bfa", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.15)" },
    { label: t.dashboard.verifiedVendors, value: "12,000+", change: "+340", color: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
    { label: t.dashboard.satisfaction, value: "98.4%", change: t.dashboard.excellent, color: "#fbbf24", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
  ];

  const testimonials = testimonialMeta.map((meta, i) => ({
    ...meta,
    text: t.testimonials.texts[i],
  }));

  return (
    <PublicLayout>
      {/* ═══════════════════════════════════════════════════
          HERO — premium full-screen
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden text-white min-h-screen flex flex-col">

        {/* ── Deep layered background ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #010308 0%, #020510 50%, #010208 100%)" }} />
          <div className="absolute inset-0 opacity-[0.28]" style={{
            backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }} />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{ width: 700, height: 700, top: -180, right: -100, background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(79,70,229,0.10) 50%, transparent 75%)" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[140px]"
            style={{ width: 600, height: 600, bottom: -100, left: -80, background: "radial-gradient(circle, rgba(124,58,237,0.20) 0%, rgba(139,92,246,0.08) 55%, transparent 80%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{ width: 500, height: 400, top: "30%", left: "30%", background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[350px]"
            style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.08) 80%, transparent 100%)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px]"
            style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-[42%] left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent 0%, rgba(99,102,241,0.15) 30%, rgba(139,92,246,0.15) 70%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-48"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(1,3,8,0.8))" }} />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-center">

            {/* ══════════════ LEFT — copy ══════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2.5 py-2 px-4 rounded-full mb-8"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)"
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                </span>
                <span className="text-indigo-300 text-xs font-bold tracking-[0.12em] uppercase">{t.hero.badge}</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400/70" />
              </motion.div>

              {/* Headline */}
              <div className="mb-7">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[34px] xs:text-[42px] sm:text-[54px] xl:text-[72px] font-black tracking-[-0.03em] leading-[1.03]"
                >
                  <span className="text-white block">{t.hero.headline1}</span>
                  <span className="block relative mt-1">
                    <span style={{
                      background: "linear-gradient(95deg, #60a5fa 0%, #818cf8 35%, #a78bfa 65%, #c084fc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {t.hero.headline2}
                    </span>
                  </span>
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="text-base lg:text-[17px] text-white/45 mb-10 max-w-[460px] leading-[1.75]"
              >
                {t.hero.subtext}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <Button size="lg" asChild className="h-[54px] px-9 text-[15px] font-bold rounded-2xl border-0 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    boxShadow: "0 8px 32px rgba(37,99,235,0.35), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                  }}>
                  <Link href="/register?role=customer">
                    {t.hero.buyBtn} <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" asChild
                  className="h-[54px] px-9 text-[15px] font-bold rounded-2xl text-white transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                  }}>
                  <Link href="/register?role=vendor">
                    {t.hero.sellBtn} <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </Button>
              </motion.div>

              {/* Trust pills */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-x-6 gap-y-3"
              >
                {[
                  { label: t.trustPills.gstVerified, color: "text-emerald-400" },
                  { label: t.trustPills.escrow, color: "text-blue-400" },
                  { label: t.trustPills.zeroCommission, color: "text-violet-400" },
                  { label: t.trustPills.freeToJoin, color: "text-amber-400" },
                ].map((pill) => (
                  <div key={pill.label} className="flex items-center gap-2 text-[13px] text-white/40">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${pill.color}`} />
                    <span>{pill.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ══════════════ RIGHT — premium dashboard ══════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex items-center justify-center"
            >
              {/* Glow halo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] rounded-full blur-[80px] opacity-25"
                  style={{ background: "radial-gradient(circle, #4f46e5 0%, #7c3aed 40%, transparent 70%)" }} />
              </div>

              {/* ── Main card ── */}
              <div className="relative w-full max-w-[370px]"
                style={{ filter: "drop-shadow(0 40px 80px rgba(79,70,229,0.18))" }}
              >
                <div className="rounded-3xl overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.3) inset"
                  }}
                >
                  {/* Card header */}
                  <div className="px-6 pt-5 pb-4 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/70 text-xs font-bold tracking-wider uppercase">{t.dashboard.liveMarketplace}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                      </span>
                      {t.dashboard.live}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Metric grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {dashboardMetrics.map((m) => (
                        <div key={m.label} className="rounded-2xl p-3.5"
                          style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                          <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1.5">{m.label}</p>
                          <p className="font-black text-[18px] leading-none" style={{ color: m.color }}>{m.value}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <TrendingUp className="w-2.5 h-2.5" style={{ color: m.color }} />
                            <p className="text-[9px] font-bold" style={{ color: m.color }}>{m.change}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bar chart */}
                    <div className="rounded-2xl p-4 mb-4"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{t.dashboard.monthlyGMV}</p>
                        <p className="text-emerald-400 text-[10px] font-bold">↑ 34%</p>
                      </div>
                      <div className="flex items-end justify-between gap-1 h-[52px]">
                        {[28, 42, 35, 58, 48, 72, 62, 88, 74, 92, 68, 100].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t"
                            initial={{ scaleY: 0, originY: 1 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 + i * 0.04, ease: "easeOut" }}
                            style={{
                              height: `${h}%`,
                              background: i === 11
                                ? "linear-gradient(to top, #4f46e5, #818cf8)"
                                : `linear-gradient(to top, rgba(79,70,229,${0.25 + h / 280}), rgba(99,102,241,${0.15 + h / 350}))`,
                              borderRadius: "3px 3px 0 0"
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        {["Apr", "Jun", "Aug", "Oct", "Dec", "Mar"].map(m => (
                          <span key={m} className="text-white/20 text-[8px] font-medium">{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Activity feed */}
                    <div className="space-y-2">
                      {[
                        { name: "TechCorp India", product: "Industrial Sensors ×500", time: "2", color: "from-blue-500 to-indigo-600", value: "₹2.4L" },
                        { name: "AgriFirst Ltd", product: "Drip Irrigation Kit ×200", time: "7", color: "from-emerald-500 to-teal-600", value: "₹85K" },
                        { name: "FashionHub", product: "Cotton Fabric ×1000m", time: "14", color: "from-violet-500 to-purple-600", value: "₹1.1L" },
                      ].map((a) => (
                        <div key={a.name} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}>
                            {a.name.slice(0, 2)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/75 text-[11px] font-bold truncate">{a.name}</p>
                            <p className="text-white/30 text-[9px] truncate">{a.product}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-emerald-400 text-[10px] font-bold">{a.value}</p>
                            <p className="text-white/20 text-[9px]">{a.time}m {t.dashboard.ago}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Floating badge: top-right ── */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 rounded-2xl px-4 py-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset"
                  }}
                >
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{t.dashboard.newOrder}</p>
                  <p className="text-white font-black text-base leading-tight">₹4,80,000</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <p className="text-emerald-400 text-[9px] font-bold">{t.dashboard.escrowProtected}</p>
                  </div>
                </motion.div>

                {/* ── Floating badge: bottom-left ── */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-5 -left-7 rounded-2xl px-4 py-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/80 text-[11px] font-bold">{t.dashboard.gstVerified}</p>
                      <p className="text-white/35 text-[9px]">12,000+ {t.dashboard.suppliers}</p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Floating badge: left-center (quote) ── */}
                <motion.div
                  animate={{ x: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-1/3 -left-14 rounded-xl px-3 py-2.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(234,88,12,0.08) 100%)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.1)"
                  }}
                >
                  <p className="text-amber-400/70 text-[8px] font-bold uppercase tracking-widest">{t.dashboard.quoteReady}</p>
                  <p className="text-white font-bold text-[11px]">18 {t.dashboard.vendorsMatched}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="relative z-10"
        >
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)" }}>
            <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4">
              {statsData.map((s, i) => (
                <div key={i} className="text-center px-4 py-1 relative">
                  {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px hidden sm:block" style={{ background: "rgba(255,255,255,0.08)" }} />}
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</p>
                  <p className="text-white/30 text-[11px] mt-0.5 font-semibold tracking-widest uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST LOGOS — infinite marquee
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden py-5" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-8 mb-0">
          <div className="flex-shrink-0 px-6">
            <span className="text-white/20 text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap">{t.trusted.label}</span>
          </div>
          <div className="overflow-hidden flex-1">
            <motion.div
              className="flex items-center gap-12 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              {[
                "TechCorp India", "MegaSupply Ltd", "AgriFirst", "AutoParts Direct",
                "MedEquip Co", "HomeDecor Hub", "FashionBulk", "IndustrialPro", "ElectroBulk",
                "TechCorp India", "MegaSupply Ltd", "AgriFirst", "AutoParts Direct",
                "MedEquip Co", "HomeDecor Hub", "FashionBulk", "IndustrialPro", "ElectroBulk",
              ].map((b, i) => (
                <span key={i} className="text-white/22 text-[13px] font-bold tracking-wide"
                  style={{ flexShrink: 0 }}>
                  {b}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/10 mx-6 align-middle" />
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CATEGORIES — premium bento grid
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">{t.categories.browseByIndustry}</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {t.categories.exploreTop}<br />
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{t.categories.wholesaleCategories}</span>
              </h2>
            </div>
            <Link href="/categories" className="group flex items-center gap-2 text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors whitespace-nowrap">
              {t.categories.viewAll}
              <span className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-400/50 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesMeta.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link href={`/products?category=${cat.key}`} className="group block h-full">
                  <div className={`relative rounded-2xl p-6 border ${cat.border} bg-gradient-to-br ${cat.gradient} hover:shadow-xl ${cat.glow} transition-all duration-300 h-full overflow-hidden`}>
                    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${cat.gradient} blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                    {cat.tag && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                        {cat.tag === "mostPopular" ? t.categories.mostPopular : t.categories.topSeller}
                      </span>
                    )}
                    <div className="text-4xl mb-4">{cat.emoji}</div>
                    <h3 className="font-bold text-white text-base leading-snug mb-1">{t.categories.names[i]}</h3>
                    <p className="text-white/40 text-xs">{cat.count} {t.categories.products}</p>
                    <div className="mt-4 flex items-center gap-1 text-white/30 text-xs group-hover:text-white/60 transition-colors">
                      <span>{t.categories.explore}</span> <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PRODUCTS — premium section
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#060a11] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3">{t.products.trendingNow}</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                {t.products.headline1}<br />
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{t.products.headline2}</span>
              </h2>
              <p className="text-white/35 mt-3 text-sm max-w-md">{t.products.subtitle}</p>
            </div>
            <Link href="/products" className="group flex items-center gap-2 text-indigo-400 font-semibold text-sm hover:text-indigo-300 transition-colors whitespace-nowrap">
              {t.home.browseCatalog}
              <span className="w-8 h-8 rounded-full border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-400/50 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-[380px] w-full rounded-2xl bg-white/5" />)}
            </div>
          ) : productData?.products?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {productData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/8 rounded-3xl bg-white/3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-bold text-white/60">{t.products.catalogLoading}</h3>
              <p className="text-white/30 text-sm mt-2">{t.products.catalogSubtext}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES — asymmetric bento grid
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#080c14] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">{t.features.sectionLabel}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {t.features.headline1}<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{t.features.headline2}</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              {t.features.subtitle}
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}
              className="md:col-span-2 relative rounded-3xl p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/15 overflow-hidden group hover:border-blue-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-6xl font-black text-white">100%</span>
                <span className="text-blue-300 font-semibold mb-2">{t.features.gstStat}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">{t.features.gstTitle}</h3>
              <p className="text-white/45 text-sm leading-relaxed max-w-md">
                {t.features.gstDesc}
              </p>
              <div className="mt-6 flex gap-3">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 text-blue-300 bg-blue-500/8">{t.features.gstTag1}</span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 text-blue-300 bg-blue-500/8">{t.features.gstTag2}</span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 text-blue-300 bg-blue-500/8">{t.features.gstTag3}</span>
              </div>
            </motion.div>

            {/* Tall card */}
            <motion.div
              whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-3xl p-7 bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border border-emerald-500/15 overflow-hidden group hover:border-emerald-500/30 transition-all"
            >
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">{t.features.escrowTitle}</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                {t.features.escrowDesc}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <p className="text-emerald-400 font-extrabold text-xl">₹0</p>
                  <p className="text-white/35 text-xs mt-0.5">{t.features.buyingFeeLabel}</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <p className="text-emerald-400 font-extrabold text-xl">24h</p>
                  <p className="text-white/35 text-xs mt-0.5">{t.features.disputeLabel}</p>
                </div>
              </div>
            </motion.div>

            {/* Small cards row */}
            {t.features.smallCards.map((card, i) => {
              const meta = smallCardsMeta[i];
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -3 }} transition={{ type: "spring", stiffness: 250 }}
                  className={`relative rounded-3xl p-6 bg-gradient-to-br ${meta.bg} border ${meta.border} overflow-hidden group transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg`}>
                      <meta.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/25 text-xs font-bold border border-white/10 rounded-full px-2.5 py-1">{card.stat}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2">{card.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS — 3-column infinite scroll
      ═══════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#060a11] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">{t.testimonials.sectionLabel}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {t.testimonials.headline1}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">2 {language === "en" ? "Lakh+" : language === "hi" ? "लाख+" : "লক্ষ+"}</span> {t.testimonials.headline2}
            </h2>
            <p className="text-white/35 mt-4 max-w-md mx-auto text-sm">{t.testimonials.subtitle}</p>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="text-white/40 text-sm ml-2">4.9 / 5 {t.testimonials.rating}</span>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[480px] overflow-hidden"
            style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)" }}
          >
            {[0, 1, 2].map((col) => {
              const colItems = testimonials.filter((_, i) => i % 3 === col);
              const doubled = [...colItems, ...colItems];
              return (
                <motion.div
                  key={col}
                  className="flex flex-col gap-4"
                  animate={{ y: col === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
                  transition={{ duration: col === 1 ? 20 : 26, repeat: Infinity, ease: "linear" }}
                >
                  {doubled.map((item, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                          {item.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-white/35 text-xs">{item.role}</p>
                        </div>
                        <div className="ml-auto flex">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/55 text-sm leading-relaxed">"{item.text}"</p>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA — dark split design
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#080c14] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800" />
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04) 0%, transparent 40%)" }} />
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 0, transparent 50%)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left — Buyers */}
              <div className="p-8 sm:p-12 lg:p-16">
                <p className="text-blue-200/60 font-bold text-xs uppercase tracking-widest mb-4">{t.cta.forBuyers}</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight whitespace-pre-line">
                  {t.cta.buyerHeadline}
                </h2>
                <p className="text-white/55 mb-8 leading-relaxed">{t.cta.buyerDesc}</p>
                <Button size="lg" className="h-13 px-8 text-base font-bold rounded-2xl bg-white text-indigo-700 hover:bg-white/90 shadow-2xl shadow-black/30 hover:-translate-y-0.5 transition-all" asChild>
                  <Link href="/register?role=customer">{t.cta.buyerBtn} <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
              </div>

              {/* Divider */}
              <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px bg-white/10" />

              {/* Right — Vendors */}
              <div className="p-8 sm:p-12 lg:p-16 lg:pl-16">
                <p className="text-violet-200/60 font-bold text-xs uppercase tracking-widest mb-4">{t.cta.forVendors}</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight whitespace-pre-line">
                  {t.cta.vendorHeadline}
                </h2>
                <p className="text-white/55 mb-8 leading-relaxed">{t.cta.vendorDesc}</p>
                <Button size="lg" className="h-13 px-8 text-base font-bold rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5 transition-all" asChild>
                  <Link href="/register?role=vendor">{t.cta.vendorBtn} <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <div className="mt-6 flex gap-4">
                  {["Basic ₹999", "Standard ₹2499", "Premium ₹4999"].map(p => (
                    <span key={p} className="text-xs font-semibold text-white/35 border border-white/10 rounded-full px-3 py-1">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6" />
      </section>
    </PublicLayout>
  );
}
