import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Store, Users, Package, ShoppingBag,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock,
  IndianRupee, Star, MapPin, BadgeCheck, RefreshCw,
  Search, Eye, MoreHorizontal, ArrowUpRight, Filter,
  Tags, CreditCard, Activity, ShieldAlert, MessageSquare,
  Mail, Phone, User, BookOpen, Building2, HeadphonesIcon, ChevronDown, ChevronUp,
  Image, Globe, Trash2, Plus, Percent, BarChart3, FileText, Zap, Crown, PieChart
} from "lucide-react";
import { useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useAdminFetch<T>(url: string, deps: any[] = []) {
  const { token } = useAdminAuthStore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}${url}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: () => setLoading(true) };
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, change, changeUp }: any) {
  return (
    <div className="bg-white/3 rounded-3xl border border-white/8 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-white/6 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change != null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${changeUp ? "text-emerald-400" : "text-red-400"}`}>
            {changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview() {
  const { data: stats, loading } = useAdminFetch<any>("/api/admin/stats");
  const { data: vendorsData, loading: vLoading } = useAdminFetch<any>("/api/admin/vendors?status=pending&limit=5");
  const { token } = useAdminAuthStore();

  const handleApprove = async (id: number) => {
    await fetch(`${BASE}/api/admin/vendors/${id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const handleReject = async (id: number) => {
    await fetch(`${BASE}/api/admin/vendors/${id}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Does not meet requirements" }),
    });
    window.location.reload();
  };

  const statCards = [
    { label: "Total Revenue", value: `₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`, icon: IndianRupee, color: "text-emerald-400", change: "+18%", changeUp: true },
    { label: "Total Vendors", value: stats?.totalVendors || 6, icon: Store, color: "text-blue-400", change: "+3", changeUp: true },
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-violet-400", change: "+12%", changeUp: true },
    { label: "Pending Approvals", value: stats?.pendingVendors || 0, icon: Clock, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl bg-white/5" />)
          : statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform highlights */}
        <div className="bg-white/3 rounded-3xl border border-white/8 p-6">
          <h3 className="text-white font-bold text-lg mb-5">Platform Highlights</h3>
          <div className="space-y-4">
            {[
              { label: "Approved Vendors", value: "6", bar: 75, color: "bg-blue-500" },
              { label: "Active Products", value: "27+", bar: 55, color: "bg-indigo-500" },
              { label: "Trade Volume (GMV)", value: "₹850Cr+", bar: 85, color: "bg-emerald-500" },
              { label: "Satisfaction Score", value: "98.4%", bar: 98, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/6">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor approval queue */}
        <div className="bg-white/3 rounded-3xl border border-white/8 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg">Vendor Approval Queue</h3>
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">
              {vendorsData?.vendors?.length ?? 0} pending
            </Badge>
          </div>
          {vLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)}</div>
          ) : vendorsData?.vendors?.length > 0 ? (
            <div className="space-y-3">
              {vendorsData.vendors.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-white/6 bg-white/2">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{v.businessName}</p>
                    <p className="text-white/40 text-xs truncate">{v.email} · {v.city}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleReject(v.id)}
                      className="h-7 px-3 text-[11px] rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300">
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(v.id)}
                      className="h-7 px-3 text-[11px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25">
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-3" />
              <p className="text-white/40 text-sm">All caught up! No pending vendors.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/3 rounded-3xl border border-white/8 p-6">
        <h3 className="text-white font-bold text-lg mb-5">Recent System Activity</h3>
        <div className="space-y-3">
          {[
            { action: "New vendor registered", detail: "TechCorp India applied for approval", time: "2m ago", type: "info" },
            { action: "Product approved", detail: "ESP32 IoT Module approved by system", time: "15m ago", type: "success" },
            { action: "Large order placed", detail: "₹4,80,000 order via escrow — TechCorp India", time: "1h ago", type: "success" },
            { action: "Vendor approved", detail: "MedEquip Traders account activated", time: "3h ago", type: "success" },
            { action: "Support ticket opened", detail: "FashionBulk Hub: Payment dispute #1023", time: "5h ago", type: "warning" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === "success" ? "bg-emerald-400" : a.type === "warning" ? "bg-amber-400" : "bg-blue-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-semibold">{a.action}</p>
                <p className="text-white/35 text-xs mt-0.5 truncate">{a.detail}</p>
              </div>
              <span className="text-white/25 text-xs flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── VENDORS ──────────────────────────────────────────────────────────────────
function VendorsPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, loading } = useAdminFetch<any>("/api/admin/vendors?limit=50");
  const { token } = useAdminAuthStore();

  const vendors: any[] = data?.vendors ?? [];
  const filtered = vendors.filter((v) => {
    const matchSearch = !search || v.businessName.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => ({
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
    suspended: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  })[s] ?? "bg-white/10 text-white/40";

  const planColor = (p: string) => ({ premium: "text-amber-400", standard: "text-blue-400", basic: "text-slate-400" })[p] ?? "text-white/40";

  const handleAction = async (id: number, action: "approve" | "reject" | "suspend") => {
    const url = action === "approve" ? `/api/admin/vendors/${id}/approve` : action === "reject" ? `/api/admin/vendors/${id}/reject` : `/api/admin/vendors/${id}/suspend`;
    await fetch(`${BASE}${url}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Admin action" }),
    });
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors…"
            className="pl-9 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        </div>
        {["all", "approved", "pending", "rejected", "suspended"].map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "ghost"}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl text-xs capitalize h-10 ${statusFilter === s ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white/80"}`}>
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              {["Business", "Email", "Location", "Plan", "Rating", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/4">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                </tr>
              ))
              : filtered.map((v) => (
                <tr key={v.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {v.businessName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{v.businessName}</p>
                        <p className="text-white/30 text-[10px]">{v.gstNumber ?? "No GST"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{v.email}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{[v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold capitalize ${planColor(v.subscriptionPlan)}`}>{v.subscriptionPlan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/60 text-sm flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {parseFloat(v.rating || "0").toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] capitalize border ${statusColor(v.status)}`}>{v.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {v.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => handleAction(v.id, "approve")}
                            className="h-6 px-2 text-[10px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25">✓</Button>
                          <Button size="sm" onClick={() => handleAction(v.id, "reject")}
                            className="h-6 px-2 text-[10px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">✕</Button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <Button size="sm" onClick={() => handleAction(v.id, "suspend")}
                          className="h-6 px-2 text-[10px] rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20">Suspend</Button>
                      )}
                      {v.status === "suspended" && (
                        <Button size="sm" onClick={() => handleAction(v.id, "approve")}
                          className="h-6 px-2 text-[10px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25">Restore</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No vendors found</div>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsPanel() {
  const [search, setSearch] = useState("");
  const { data, loading } = useAdminFetch<any>("/api/products?limit=50");
  const products: any[] = data?.products ?? [];
  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
          className="pl-9 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              {["Product", "Vendor", "Category", "Price", "MOQ", "Stock", "Rating"].map((h) => (
                <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-white/4">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                </tr>
              ))
              : filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-white/30 text-[10px]">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{p.vendorName || `Vendor #${p.vendorId}`}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{p.categoryName || "—"}</td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{p.moq} {p.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.stock > 100 ? "text-emerald-400" : p.stock > 0 ? "text-amber-400" : "text-red-400"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <Star className="w-3 h-3 fill-current" /> {(p.rating || 0).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No products found</div>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
function CustomersPanel() {
  const [search, setSearch] = useState("");
  const { data, loading } = useAdminFetch<any[]>("/api/admin/customers");
  const customers: any[] = data ?? [];

  const filtered = customers.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…"
          className="pl-9 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              {["Customer", "Email", "Phone", "Joined", "Status"].map((h) => (
                <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/4">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                </tr>
              ))
              : filtered.map((c) => (
                <tr key={c.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {(c.name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{c.email}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border ${c.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No customers registered yet</div>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function CategoriesPanel() {
  const cats = [
    { name: "Electronics & Tech", icon: "💻", products: 3, vendors: 1 },
    { name: "Industrial Machinery", icon: "⚙️", products: 3, vendors: 1 },
    { name: "Fashion & Apparel", icon: "👗", products: 2, vendors: 1 },
    { name: "Agriculture & Farm", icon: "🌾", products: 2, vendors: 1 },
    { name: "Medical & Pharma", icon: "🏥", products: 2, vendors: 1 },
    { name: "Home & Decor", icon: "🏠", products: 2, vendors: 1 },
    { name: "Automotive Parts", icon: "🚗", products: 0, vendors: 0 },
    { name: "Food & Beverages", icon: "🍱", products: 0, vendors: 0 },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {cats.map((c) => (
        <div key={c.name} className="bg-white/3 rounded-3xl border border-white/8 p-5 hover:border-indigo-500/25 transition-all">
          <div className="text-3xl mb-3">{c.icon}</div>
          <h3 className="text-white font-bold text-sm mb-2">{c.name}</h3>
          <div className="flex gap-4 text-xs text-white/40">
            <span>{c.products} products</span>
            <span>{c.vendors} vendors</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CONTACT MESSAGES ─────────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  general:     { label: "General",     icon: MessageSquare,    color: "text-blue-400 bg-blue-500/12" },
  vendor:      { label: "Vendor",      icon: Building2,        color: "text-violet-400 bg-violet-500/12" },
  buyer:       { label: "Buyer",       icon: HeadphonesIcon,   color: "text-emerald-400 bg-emerald-500/12" },
  partnership: { label: "Partnership", icon: BookOpen,         color: "text-amber-400 bg-amber-500/12" },
  billing:     { label: "Billing",     icon: CreditCard,       color: "text-rose-400 bg-rose-500/12" },
};

function ContactMessagesPanel() {
  const { data: messages, loading } = useAdminFetch<any[]>("/api/admin/contact-messages");
  const { token } = useAdminAuthStore();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const markRead = async (id: number) => {
    await fetch(`/api/admin/contact-messages/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const list = (messages || []).filter((m: any) => {
    if (filter === "unread") return m.status === "unread";
    if (filter === "read") return m.status === "read";
    return true;
  });

  const unreadCount = (messages || []).filter((m: any) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Messages", value: messages?.length ?? 0, color: "text-blue-400" },
          { label: "Unread", value: unreadCount, color: "text-amber-400" },
          { label: "Read", value: (messages?.length ?? 0) - unreadCount, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 rounded-2xl border border-white/8 p-5 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
            <MessageSquare className="w-10 h-10 text-white/15 mb-3" />
            <p className="text-white/40 text-sm">No messages found</p>
          </div>
        ) : list.map((msg: any) => {
          const typeMeta = TYPE_META[msg.type] || { label: msg.type || "General", icon: MessageSquare, color: "text-white/40 bg-white/8" };
          const TypeIcon = typeMeta.icon;
          const isOpen = expanded === msg.id;
          return (
            <div
              key={msg.id}
              className={`bg-white/3 rounded-2xl border transition-all ${
                msg.status === "unread" ? "border-indigo-500/25" : "border-white/8"
              }`}
            >
              <div
                className="flex items-start gap-4 p-5 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : msg.id)}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${typeMeta.color}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold text-sm truncate">{msg.name}</p>
                    {msg.status === "unread" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto flex-shrink-0 ${typeMeta.color}`}>
                      {typeMeta.label}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs">{msg.email}{msg.phone && ` · ${msg.phone}`}</p>
                  {msg.subject && <p className="text-white/70 text-xs font-medium mt-1 truncate">{msg.subject}</p>}
                  <p className="text-white/35 text-xs mt-1 truncate">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-white/25 text-[10px]">{new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 border-t border-white/6">
                  <p className="text-white/70 text-sm leading-relaxed mt-4 mb-4 whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-white/60 hover:text-white/90 text-xs transition-all border border-white/8"
                    >
                      <Mail className="w-3.5 h-3.5" /> Reply via Email
                    </a>
                    {msg.status === "unread" && (
                      <button
                        onClick={() => markRead(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/20 text-xs transition-all border border-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PLACEHOLDER SECTION ──────────────────────────────────────────────────────
function PlaceholderSection({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center bg-white/3 rounded-3xl border border-white/8">
      <Icon className="w-10 h-10 text-white/20 mb-4" />
      <p className="text-white/40 text-sm">{label} management coming soon</p>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersPanel() {
  const { data, loading } = useAdminFetch<any>("/api/admin/orders?limit=50");
  const { token } = useAdminAuthStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const orders: any[] = data?.orders ?? [];
  const filtered = orders.filter(o => statusFilter === "all" || o.status === statusFilter);
  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    processing: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/25",
  };
  const updateStatus = async (id: number, status: string) => {
    await fetch(`${BASE}/api/orders/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
          <Button key={s} size="sm" onClick={() => setStatusFilter(s)}
            className={`rounded-xl text-xs capitalize h-9 ${statusFilter === s ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white/80 bg-transparent border-white/10 border"}`}>
            {s}
          </Button>
        ))}
      </div>
      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/6">
            {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Update Status"].map(h => (
              <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-white/4">{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}</tr>
            )) : filtered.map(o => (
              <tr key={o.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white text-sm font-mono">{o.orderNumber}</td>
                <td className="px-4 py-3 text-white/50 text-sm">#{o.customerId}</td>
                <td className="px-4 py-3 text-white/50 text-sm">{Array.isArray(o.items) ? o.items.length : "—"}</td>
                <td className="px-4 py-3 text-white font-semibold text-sm">₹{Number(o.total).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3"><Badge className={`text-[10px] capitalize border ${o.paymentStatus === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>{o.paymentStatus}</Badge></td>
                <td className="px-4 py-3"><Badge className={`text-[10px] capitalize border ${statusColors[o.status] ?? "bg-white/10 text-white/40"}`}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-white/30 text-xs">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                <td className="px-4 py-3">
                  <select onChange={e => updateStatus(o.id, e.target.value)} value={o.status}
                    className="text-[11px] bg-white/5 border border-white/10 text-white/60 rounded-lg px-2 py-1 cursor-pointer">
                    {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <div className="text-center py-12 text-white/30">No orders found</div>}
      </div>
    </div>
  );
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
function PaymentsPanel() {
  const { data: payments, loading } = useAdminFetch<any[]>("/api/admin/payments");
  const list = payments ?? [];
  const totalPaid = list.filter((p: any) => p.status === "paid").reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: list.length, color: "text-blue-400" },
          { label: "Successful", value: list.filter((p: any) => p.status === "paid").length, color: "text-emerald-400" },
          { label: "Total Revenue", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/3 rounded-2xl border border-white/8 p-5 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <p className="text-indigo-300 text-sm"><strong>Razorpay Gateway:</strong> Integration is Under Development. Payments shown here are test/demo transactions.</p>
      </div>
      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/6">
            {["Transaction ID", "Order ID", "User", "Amount", "Method", "Status", "Date"].map(h => (
              <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-white/4">{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}</tr>
            )) : list.map((p: any) => (
              <tr key={p.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white/50 text-xs font-mono max-w-[120px] truncate">{p.transactionId}</td>
                <td className="px-4 py-3 text-white/50 text-sm">#{p.orderId}</td>
                <td className="px-4 py-3 text-white/50 text-sm">#{p.userId}</td>
                <td className="px-4 py-3 text-white font-semibold text-sm">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-white/50 text-xs capitalize">{p.method}</td>
                <td className="px-4 py-3"><Badge className={`text-[10px] capitalize border ${p.status === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-white/30 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && list.length === 0 && <div className="text-center py-12 text-white/30">No payment records yet</div>}
      </div>
    </div>
  );
}

// ─── COUPONS ──────────────────────────────────────────────────────────────────
function CouponsPanel() {
  const { data: coupons, loading } = useAdminFetch<any[]>("/api/admin/coupons");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${BASE}/api/admin/coupons`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null, maxUses: form.maxUses ? Number(form.maxUses) : null }),
    });
    setShowForm(false);
    setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  const list = coupons ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/3 rounded-2xl border border-indigo-500/25 p-6 space-y-4">
          <h3 className="text-white font-bold">New Coupon</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-white/50 text-xs mb-1 block">Code *</label>
              <Input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="SAVE20" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Type</label>
              <select value={form.discountType} onChange={e => set("discountType", e.target.value)} className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white px-3 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select></div>
            <div><label className="text-white/50 text-xs mb-1 block">Discount Value *</label>
              <Input type="number" value={form.discountValue} onChange={e => set("discountValue", e.target.value)} placeholder="20" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Min Order Amount</label>
              <Input type="number" value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)} placeholder="500" className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Max Uses</label>
              <Input type="number" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} placeholder="100" className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Expires At</label>
              <Input type="date" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl text-white/50 h-9">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">Create</Button>
          </div>
        </form>
      )}

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/6">
            {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Active", ""].map(h => (
              <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-white/4">{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}</tr>
            )) : list.map((c: any) => (
              <tr key={c.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-bold font-mono text-sm">{c.code}</td>
                <td className="px-4 py-3 text-white/50 text-sm capitalize">{c.discountType}</td>
                <td className="px-4 py-3 text-white font-semibold text-sm">{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="px-4 py-3 text-white/50 text-sm">{c.minOrderAmount ? `₹${c.minOrderAmount}` : "—"}</td>
                <td className="px-4 py-3 text-white/50 text-sm">{c.usedCount}/{c.maxUses ?? "∞"}</td>
                <td className="px-4 py-3 text-white/30 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                <td className="px-4 py-3"><Badge className={`text-[10px] border ${c.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"}`}>{c.isActive ? "Active" : "Inactive"}</Badge></td>
                <td className="px-4 py-3">
                  <Button size="sm" onClick={() => handleDelete(c.id)} className="h-6 px-2 text-[10px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="w-3 h-3" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && list.length === 0 && <div className="text-center py-12 text-white/30">No coupons yet</div>}
      </div>
    </div>
  );
}

// ─── SUBSCRIPTION PLANS ────────────────────────────────────────────────────────
function SubscriptionPlansPanel() {
  const { data: plans, loading } = useAdminFetch<any[]>("/api/admin/subscription-plans");
  const { token } = useAdminAuthStore();
  const [editing, setEditing] = useState<any>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${BASE}/api/admin/subscription-plans/${editing.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...editing, price: Number(editing.price), maxProducts: Number(editing.maxProducts), maxCategories: Number(editing.maxCategories) }),
    });
    setEditing(null);
    window.location.reload();
  };

  const list = plans ?? [];
  const planColors: Record<string, string> = { basic: "text-slate-400", standard: "text-blue-400", premium: "text-amber-400" };

  return (
    <div className="space-y-5">
      <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <p className="text-indigo-300 text-sm"><strong>Razorpay Payments:</strong> Under Development — vendors can subscribe to the free Basic plan. Paid plans will activate once Razorpay is live.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl bg-white/5" />) :
          list.map((plan: any) => (
            <div key={plan.id} className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-extrabold capitalize ${planColors[plan.slug] ?? "text-white"}`}>{plan.name}</p>
                  <p className="text-white/40 text-xs mt-0.5 capitalize">{plan.billingCycle} billing</p>
                </div>
                <p className="text-2xl font-extrabold text-white">{plan.price === 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}</p>
              </div>
              <div className="space-y-1.5 text-xs text-white/50">
                <p>Max Products: <span className="text-white font-semibold">{plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts}</span></p>
                <p>Max Categories: <span className="text-white font-semibold">{plan.maxCategories === -1 ? "All" : plan.maxCategories}</span></p>
                <p>Banner Upload: <span className={`font-semibold ${plan.canUploadBanner ? "text-emerald-400" : "text-red-400"}`}>{plan.canUploadBanner ? "Yes" : "No"}</span></p>
                <p>Featured Listing: <span className={`font-semibold ${plan.isFeatured ? "text-emerald-400" : "text-red-400"}`}>{plan.isFeatured ? "Yes" : "No"}</span></p>
                <p>Status: <span className={`font-semibold ${plan.isActive ? "text-emerald-400" : "text-red-400"}`}>{plan.isActive ? "Active" : "Inactive"}</span></p>
              </div>
              <Button onClick={() => setEditing({ ...plan })} size="sm" className="w-full rounded-xl h-8 text-xs bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Edit Plan</Button>
            </div>
          ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <form onSubmit={handleUpdate} className="relative bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">Edit Plan: {editing.name}</h3>
            <div className="space-y-3">
              {[
                { label: "Plan Name", key: "name", type: "text" },
                { label: "Price (₹/month)", key: "price", type: "number" },
                { label: "Max Products (-1 = unlimited)", key: "maxProducts", type: "number" },
                { label: "Max Categories (-1 = all)", key: "maxCategories", type: "number" },
              ].map(f => (
                <div key={f.key}><label className="text-white/50 text-xs mb-1 block">{f.label}</label>
                  <Input type={f.type} value={editing[f.key]} onChange={e => setEditing((p: any) => ({ ...p, [f.key]: e.target.value }))} className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
              ))}
              <div className="flex gap-6">
                {[["canUploadBanner", "Banner Upload"], ["isFeatured", "Featured Listing"], ["isActive", "Active"]].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!editing[k]} onChange={e => setEditing((p: any) => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4" />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="rounded-xl text-white/50 h-9">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">Save Changes</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── COMMISSION ───────────────────────────────────────────────────────────────
function CommissionPanel() {
  const { data, loading } = useAdminFetch<any>("/api/admin/commission");
  const { token } = useAdminAuthStore();
  const [rate, setRate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setRate(String(data.defaultRate ?? 10));
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`${BASE}/api/admin/commission`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ defaultRate: Number(rate), categoryRates: data?.categoryRates ?? [] }),
    });
    setSaving(false);
    window.location.reload();
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
        <h3 className="text-white font-bold text-lg mb-4">Platform Commission Settings</h3>
        <p className="text-white/40 text-sm mb-6 leading-relaxed">
          Set the default commission rate Vendorkart charges on every order. This applies to all vendors unless a category-specific rate is configured.
        </p>
        {loading ? <Skeleton className="h-16 rounded-xl bg-white/5" /> : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm font-semibold mb-2 block">Default Commission Rate</label>
              <div className="flex items-center gap-4">
                <Input type="number" min="0" max="100" step="0.5" value={rate} onChange={e => setRate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white rounded-xl h-12 text-2xl font-bold w-32" />
                <span className="text-white/60 text-xl font-bold">%</span>
                <span className="text-white/30 text-sm">per transaction</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/6">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(Number(rate), 100)}%` }} />
              </div>
            </div>
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs leading-relaxed">
                <strong>Example:</strong> On a ₹10,000 order with {rate}% commission, Vendorkart earns ₹{(10000 * Number(rate) / 100).toLocaleString("en-IN")} and the vendor receives ₹{(10000 - (10000 * Number(rate) / 100)).toLocaleString("en-IN")}.
              </p>
            </div>
            <Button type="submit" disabled={saving} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10">
              {saving ? "Saving..." : "Save Commission Rate"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── BANNERS ──────────────────────────────────────────────────────────────────
function BannersPanel() {
  const { data: banners, loading } = useAdminFetch<any[]>("/api/admin/banners");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "home_top", isActive: true });
  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${BASE}/api/admin/banners`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "home_top", isActive: true });
    window.location.reload();
  };

  const handleToggle = async (b: any) => {
    await fetch(`${BASE}/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, isActive: !b.isActive }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/admin/banners/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  const list = banners ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-white/60 text-sm">Manage promotional banners shown across the marketplace.</p>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/3 rounded-2xl border border-indigo-500/25 p-6 space-y-4">
          <h3 className="text-white font-bold">New Banner</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-white/50 text-xs mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="Summer Sale — Up to 40% Off" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Subtitle</label>
              <Input value={form.subtitle} onChange={e => setF("subtitle", e.target.value)} placeholder="Shop wholesale deals now" className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Position</label>
              <select value={form.position} onChange={e => setF("position", e.target.value)} className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white px-3 text-sm">
                <option value="home_top">Homepage Top</option>
                <option value="home_mid">Homepage Middle</option>
                <option value="category_top">Category Page</option>
                <option value="product_top">Product Page</option>
              </select></div>
            <div><label className="text-white/50 text-xs mb-1 block">Image URL</label>
              <Input value={form.imageUrl} onChange={e => setF("imageUrl", e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
            <div><label className="text-white/50 text-xs mb-1 block">Link URL</label>
              <Input value={form.linkUrl} onChange={e => setF("linkUrl", e.target.value)} placeholder="/products" className="bg-white/5 border-white/10 text-white rounded-xl h-9" /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="bannerActive" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="w-4 h-4" />
            <label htmlFor="bannerActive" className="text-white/60 text-sm cursor-pointer">Active (visible on site)</label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl text-white/50 h-9">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">Create Banner</Button>
          </div>
        </form>
      )}

      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)}</div>
        : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
            <Image className="w-10 h-10 text-white/15 mb-3" />
            <p className="text-white/40 text-sm">No banners yet. Create your first promotional banner.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((b: any) => (
              <div key={b.id} className={`bg-white/3 rounded-2xl border p-5 flex items-center gap-4 ${b.isActive ? "border-indigo-500/20" : "border-white/8"}`}>
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-20 h-12 rounded-xl object-cover flex-shrink-0 bg-white/5" />
                ) : (
                  <div className="w-20 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Image className="w-5 h-5 text-white/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm truncate">{b.title}</p>
                    <Badge className={`text-[10px] border flex-shrink-0 ${b.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-white/5 text-white/30 border-white/10"}`}>{b.isActive ? "Live" : "Hidden"}</Badge>
                  </div>
                  {b.subtitle && <p className="text-white/40 text-xs mt-0.5 truncate">{b.subtitle}</p>}
                  <p className="text-white/25 text-xs mt-1 capitalize">{(b.position ?? "").replace("_", " ")}{b.linkUrl && ` · → ${b.linkUrl}`}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleToggle(b)} className={`h-7 px-3 text-[11px] rounded-lg border ${b.isActive ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"}`}>
                    {b.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(b.id)} className="h-7 px-2 text-[11px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── EMAIL LOGS ───────────────────────────────────────────────────────────────
const EMAIL_TYPE_META: Record<string, { label: string; color: string }> = {
  order_confirmation:      { label: "Order Confirmed",  color: "text-emerald-400 bg-emerald-500/12" },
  new_order_alert:         { label: "New Order Alert",  color: "text-blue-400 bg-blue-500/12" },
  vendor_registered:       { label: "Vendor Welcome",   color: "text-violet-400 bg-violet-500/12" },
  new_vendor_registration: { label: "New Vendor",       color: "text-amber-400 bg-amber-500/12" },
  subscription_activated:  { label: "Subscription",     color: "text-cyan-400 bg-cyan-500/12" },
  order_status_update:     { label: "Order Update",     color: "text-indigo-400 bg-indigo-500/12" },
};

function EmailLogsPanel() {
  const { data: logs, loading } = useAdminFetch<any[]>("/api/admin/email-logs");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const list = (logs ?? []).filter((l: any) => recipientFilter === "all" || l.recipientType === recipientFilter);

  return (
    <div className="space-y-5">
      <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
        <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p className="text-amber-300 text-sm">Email notifications are logged here. Configure an SMTP provider (e.g. Resend, Nodemailer) to send real emails. Currently stored in the database.</p>
      </div>

      <div className="flex gap-2">
        {["all", "customer", "vendor", "admin"].map(r => (
          <button key={r} onClick={() => setRecipientFilter(r)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${recipientFilter === r ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-white/40 hover:text-white/60 border border-white/8 bg-white/3"}`}>
            {r === "all" ? "All" : `${r}s`}
          </button>
        ))}
        <span className="ml-auto text-white/30 text-sm self-center">{list.length} emails</span>
      </div>

      <div className="space-y-2">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />) :
          list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
              <Mail className="w-10 h-10 text-white/15 mb-3" />
              <p className="text-white/40 text-sm">No email logs yet. They appear here when triggered by events like orders, registrations, and subscriptions.</p>
            </div>
          ) : list.map((log: any) => {
            const meta = EMAIL_TYPE_META[log.type] ?? { label: log.type, color: "text-white/40 bg-white/8" };
            return (
              <div key={log.id} className="bg-white/3 rounded-xl border border-white/8 p-4 flex items-start gap-3">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 mt-0.5 ${meta.color}`}>{meta.label}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{log.subject}</p>
                  <p className="text-white/40 text-xs mt-0.5 truncate">To: {log.recipient}</p>
                  {log.body && <p className="text-white/25 text-xs mt-1 truncate">{log.body}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge className={`text-[10px] border capitalize ${log.recipientType === "customer" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" : log.recipientType === "vendor" ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>{log.recipientType}</Badge>
                  <p className="text-white/20 text-[10px]">{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsPanel() {
  const { data, loading } = useAdminFetch<any>("/api/admin/reports");
  const stats = data ?? {};

  const metrics = [
    { label: "Total Revenue", value: `₹${(Number(stats.totalRevenue) / 100000).toFixed(1)}L`, icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Orders", value: stats.totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending Orders", value: stats.pendingOrders ?? 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Active Vendors", value: stats.approvedVendors ?? 0, icon: Store, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Total Customers", value: stats.totalCustomers ?? 0, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Total Products", value: stats.totalProducts ?? 0, icon: Package, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white/3 rounded-2xl border border-white/8 p-5">
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            {loading ? <Skeleton className="h-8 w-24 rounded-lg bg-white/5 mb-1" /> : <p className={`text-3xl font-extrabold ${m.color}`}>{m.value}</p>}
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-400" /> Top Vendors by Sales</h3>
          {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl bg-white/5" />)}</div> :
            (stats.topVendors ?? []).length === 0 ? <p className="text-white/30 text-sm text-center py-8">No vendor data yet</p> :
            (stats.topVendors ?? []).map((v: any, i: number) => (
              <div key={v.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <span className="w-6 text-center text-white/30 text-sm font-bold">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{v.businessName}</p>
                  <p className="text-white/30 text-xs">{v.productCount} products</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">₹{Number(v.totalSales || 0).toLocaleString("en-IN")}</span>
              </div>
            ))}
        </div>

        <div className="bg-white/3 rounded-2xl border border-white/8 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-indigo-400" /> Platform Health</h3>
          {[
            { label: "Vendor Approval Rate", value: stats.totalVendors ? Math.round((stats.approvedVendors / stats.totalVendors) * 100) : 0, color: "bg-emerald-500" },
            { label: "Order Fulfilment Rate", value: stats.totalOrders ? Math.round(((stats.totalOrders - (stats.pendingOrders ?? 0)) / stats.totalOrders) * 100) : 0, color: "bg-blue-500" },
            { label: "Platform Uptime", value: 99, color: "bg-amber-500" },
          ].map(item => (
            <div key={item.label} className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/60">{item.label}</span>
                <span className="text-white font-bold">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/6">
                <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SECTIONS: Record<string, { title: string; component: React.ElementType }> = {
  "/admin": { title: "Dashboard Overview", component: Overview },
  "/admin/reports": { title: "Reports & Analytics", component: ReportsPanel },
  "/admin/vendors": { title: "Vendor Management", component: VendorsPanel },
  "/admin/customers": { title: "Customer Management", component: CustomersPanel },
  "/admin/products": { title: "Product Catalog", component: ProductsPanel },
  "/admin/orders": { title: "Orders Management", component: OrdersPanel },
  "/admin/categories": { title: "Categories", component: CategoriesPanel },
  "/admin/payments": { title: "Payment Monitoring", component: PaymentsPanel },
  "/admin/coupons": { title: "Coupons", component: CouponsPanel },
  "/admin/subscriptions": { title: "Subscription Plans", component: SubscriptionPlansPanel },
  "/admin/commission": { title: "Commission Settings", component: CommissionPanel },
  "/admin/banners": { title: "Banner & Ads Management", component: BannersPanel },
  "/admin/emails": { title: "Email System", component: EmailLogsPanel },
  "/admin/contact": { title: "Contact Messages", component: ContactMessagesPanel },
  "/admin/activity": { title: "Activity Logs", component: () => <PlaceholderSection icon={Activity} label="Activity" /> },
};

export default function AdminPanel() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAdminAuthStore();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/admin-login");
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const section = SECTIONS[location] ?? SECTIONS["/admin"];
  const SectionComponent = section.component;

  return (
    <AdminLayout title={section.title}>
      <motion.div key={location} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SectionComponent />
      </motion.div>
    </AdminLayout>
  );
}
