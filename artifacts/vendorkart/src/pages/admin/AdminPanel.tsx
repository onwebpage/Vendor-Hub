import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Store, Users, Package, ShoppingBag,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock,
  IndianRupee, Star, MapPin, BadgeCheck, RefreshCw,
  Search, Eye, MoreHorizontal, ArrowUpRight, Filter,
  Tags, CreditCard, Activity, ShieldAlert
} from "lucide-react";
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
  const mockCustomers = [
    { name: "Rajesh Mehta", email: "rajesh@megasupply.com", city: "Mumbai", joined: "Jan 2025", orders: 24, spent: "₹4.2L" },
    { name: "Priya Sharma", email: "priya@fashionhub.com", city: "Delhi", joined: "Feb 2025", orders: 18, spent: "₹2.8L" },
    { name: "Anil Gupta", email: "anil@agritech.com", city: "Nagpur", joined: "Mar 2025", orders: 12, spent: "₹1.5L" },
    { name: "Sunita Patel", email: "sunita@medequip.com", city: "Ahmedabad", joined: "Apr 2025", orders: 8, spent: "₹3.1L" },
    { name: "Deepak Verma", email: "deepak@techparts.com", city: "Bengaluru", joined: "May 2025", orders: 31, spent: "₹7.4L" },
    { name: "Kavitha Nair", email: "kavitha@supply.com", city: "Chennai", joined: "Jun 2025", orders: 15, spent: "₹2.2L" },
  ];
  return (
    <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/6">
            {["Customer", "Email", "City", "Joined", "Orders", "Total Spent"].map((h) => (
              <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockCustomers.map((c, i) => (
            <tr key={i} className="border-b border-white/4 hover:bg-white/2 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {c.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <span className="text-white text-sm font-semibold">{c.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-white/50 text-sm">{c.email}</td>
              <td className="px-4 py-3 text-white/50 text-sm">{c.city}</td>
              <td className="px-4 py-3 text-white/50 text-sm">{c.joined}</td>
              <td className="px-4 py-3 text-white font-semibold text-sm">{c.orders}</td>
              <td className="px-4 py-3 text-emerald-400 font-bold text-sm">{c.spent}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

// ─── PLACEHOLDER SECTION ──────────────────────────────────────────────────────
function PlaceholderSection({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center bg-white/3 rounded-3xl border border-white/8">
      <Icon className="w-10 h-10 text-white/20 mb-4" />
      <p className="text-white/40 text-sm">{label} management coming soon</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SECTIONS: Record<string, { title: string; component: React.ElementType }> = {
  "/admin": { title: "Dashboard Overview", component: Overview },
  "/admin/vendors": { title: "Vendor Management", component: VendorsPanel },
  "/admin/customers": { title: "Customer Management", component: CustomersPanel },
  "/admin/products": { title: "Product Catalog", component: ProductsPanel },
  "/admin/orders": { title: "Orders", component: () => <PlaceholderSection icon={ShoppingBag} label="Orders" /> },
  "/admin/categories": { title: "Categories", component: CategoriesPanel },
  "/admin/payments": { title: "Payments", component: () => <PlaceholderSection icon={CreditCard} label="Payment" /> },
  "/admin/coupons": { title: "Coupons", component: () => <PlaceholderSection icon={Tags} label="Coupon" /> },
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
