import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search, Star, MapPin, Package, Shield, Crown, Zap,
  ArrowRight, Store, BadgeCheck, TrendingUp, Users
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListVendors } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PLAN_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  premium: { label: "Premium", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  standard: { label: "Standard", icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  basic: { label: "Basic", icon: Store, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: "💻", machinery: "⚙️", fashion: "👗", agriculture: "🌾",
  medical: "🏥", home: "🏠", automotive: "🚗", food: "🍱",
};

function VendorCard({ vendor }: { vendor: any }) {
  const plan = PLAN_META[vendor.subscriptionPlan] ?? PLAN_META.basic;
  const PlanIcon = plan.icon;
  const rating = vendor.rating ? parseFloat(vendor.rating) : 0;
  const initials = vendor.businessName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-card rounded-3xl border border-border/50 overflow-hidden hover:shadow-2xl hover:border-primary/25 transition-all duration-300 flex flex-col"
    >
      {/* Banner / header area */}
      <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {vendor.banner ? (
          <img
            src={vendor.banner}
            alt={vendor.businessName}
            className="w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(59,130,246,0.5), transparent 60%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.4), transparent 50%)" }} />
        )}

        {/* Featured badge */}
        {vendor.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            <TrendingUp className="w-2.5 h-2.5" /> Featured
          </div>
        )}

        {/* Plan badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 ${plan.bg} ${plan.border} border ${plan.color} text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm`}>
          <PlanIcon className="w-2.5 h-2.5" /> {plan.label}
        </div>

        {/* Logo / avatar */}
        <div className="absolute -bottom-7 left-5">
          {vendor.logo ? (
            <img
              src={vendor.logo}
              alt={vendor.businessName}
              className="w-14 h-14 rounded-2xl border-2 border-background object-cover shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl border-2 border-background bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-10 pb-5 px-5 flex flex-col flex-1">
        {/* Name + verified */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
            {vendor.businessName}
          </h3>
          <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        </div>

        {/* Location */}
        {(vendor.city || vendor.state) && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{[vendor.city, vendor.state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {vendor.description || "Verified B2B wholesale supplier on Vendorkart."}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-muted/40 rounded-xl py-2 px-1">
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-0.5">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-sm font-extrabold text-foreground">{rating > 0 ? rating.toFixed(1) : "—"}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{vendor.reviewCount} reviews</p>
          </div>
          <div className="text-center bg-muted/40 rounded-xl py-2 px-1">
            <p className="text-sm font-extrabold text-foreground mb-0.5">{vendor.productCount || 0}</p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </div>
          <div className="text-center bg-muted/40 rounded-xl py-2 px-1">
            <p className="text-sm font-extrabold text-foreground mb-0.5">GST</p>
            <p className="text-[10px] text-emerald-400 font-semibold">Verified</p>
          </div>
        </div>

        {/* CTA */}
        <Link href={`/${vendor.slug}`}>
          <Button className="w-full rounded-xl h-10 text-sm font-semibold group-hover:bg-primary transition-colors" variant="secondary">
            View Store <ArrowRight className="ml-1.5 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function VendorSkeleton() {
  return (
    <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="pt-10 pb-5 px-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function Vendors() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListVendors({
    search: activeSearch || undefined,
    page,
    limit: 12,
  });

  const vendors = data?.vendors ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
    setPage(1);
  };

  return (
    <PublicLayout>
      {/* ── Page header ── */}
      <div className="relative overflow-hidden bg-[#03050d] border-b border-white/6">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Shield className="w-3 h-3" /> GST-Verified Suppliers
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Discover Verified{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Vendors
              </span>
            </h1>
            <p className="text-white/45 text-lg max-w-xl mb-8">
              Browse {total > 0 ? `${total.toLocaleString()}+` : ""} approved wholesale suppliers, manufacturers and distributors across India.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors by name or category…"
                  className="pl-10 h-12 rounded-2xl bg-white/6 border-white/12 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:bg-white/8"
                />
              </div>
              <Button type="submit" className="h-12 px-7 rounded-2xl bg-indigo-600 hover:bg-indigo-500 border-0 font-semibold">
                Search
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Stat pills */}
        <div className="relative z-10 border-t border-white/6 bg-white/2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-6">
            {[
              { icon: Users, label: "Verified Vendors", value: "12,000+" },
              { icon: Package, label: "Products Listed", value: "1.8L+" },
              { icon: MapPin, label: "States Covered", value: "28" },
              { icon: BadgeCheck, label: "GST Verified", value: "100%" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-bold text-sm">{s.value}</span>
                <span className="text-white/35 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Vendor grid ── */}
      <div className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Result count */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground text-sm">
                {activeSearch
                  ? `${vendors.length} result${vendors.length !== 1 ? "s" : ""} for "${activeSearch}"`
                  : `Showing ${vendors.length} of ${total} vendors`}
              </p>
              {activeSearch && (
                <Button variant="ghost" size="sm" onClick={() => { setActiveSearch(""); setSearch(""); setPage(1); }}>
                  Clear search
                </Button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <VendorSkeleton key={i} />)}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-24">
              <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No vendors found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or browse all vendors.</p>
              <Button onClick={() => { setActiveSearch(""); setSearch(""); setPage(1); }}>Browse All Vendors</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendors.map((vendor, i) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
