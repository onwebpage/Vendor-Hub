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
  Image, Globe, Trash2, Plus, Percent, BarChart3, FileText, Zap, Crown, PieChart,
  X, ImageIcon, Loader2, Pencil, AlertTriangle, UserCircle2, Linkedin, Twitter,
  Github, Instagram, GripVertical, ArrowUp, ArrowDown, EyeOff
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
  const { data: activityLogs, loading: aLoading } = useAdminFetch<any[]>("/api/admin/activity-logs");
  const { token } = useAdminAuthStore();

  const relativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const activityColor = (action: string) => {
    if (action.includes("approved") || action.includes("placed") || action.includes("restored")) return "bg-emerald-400";
    if (action.includes("rejected") || action.includes("deleted") || action.includes("suspended")) return "bg-red-400";
    if (action.includes("updated")) return "bg-indigo-400";
    return "bg-blue-400";
  };

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
    { label: "Total Revenue", value: `₹${(parseFloat(String(stats?.totalRevenue ?? 0)) / 100000).toFixed(1)}L`, icon: IndianRupee, color: "text-emerald-400", change: "+18%", changeUp: true },
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
          {aLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl bg-white/5" />)
          ) : (activityLogs || []).length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No activity yet. Actions will appear here.</p>
          ) : (activityLogs || []).slice(0, 8).map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activityColor(log.action)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-semibold capitalize">{log.action.replace(/_/g, " ")}</p>
                {log.details && <p className="text-white/35 text-xs mt-0.5 truncate">{log.details}</p>}
              </div>
              <span className="text-white/25 text-xs flex-shrink-0">{relativeTime(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── VENDORS ──────────────────────────────────────────────────────────────────
const EMPTY_VENDOR_FORM = {
  name: "", email: "", password: "", businessName: "",
  phone: "", city: "", state: "", gstNumber: "", address: "", pincode: "",
  autoApprove: true,
};

function AddVendorModal({ onClose, onSuccess, token }: { onClose: () => void; onSuccess: () => void; token: string }) {
  const [form, setForm] = useState({ ...EMPTY_VENDOR_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string | boolean) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.businessName) {
      setError("Business name, contact name, email and password are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/admin/vendors`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to create vendor"); setSaving(false); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs text-white/50 font-medium mb-1">{label}</label>
      <Input
        type={type}
        placeholder={placeholder || label}
        value={(form as any)[key] as string}
        onChange={(e) => set(key, e.target.value)}
        className="h-9 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0f1117] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Add Vendor Manually</h2>
            <p className="text-white/40 text-xs mt-0.5">Create a vendor account directly without going through the registration flow.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Account info */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Account Credentials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {field("Contact Person Name *", "name", "text", "e.g. Rajesh Mehta")}
              {field("Email Address *", "email", "email", "vendor@example.com")}
              {field("Password *", "password", "password", "Set a secure password")}
              {field("Phone Number", "phone", "tel", "+91 98765 43210")}
            </div>
          </div>

          {/* Business info */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Business Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                {field("Business Name *", "businessName", "text", "e.g. TechCorp Industries Pvt Ltd")}
              </div>
              {field("GST Number", "gstNumber", "text", "22AAAAA0000A1Z5")}
              {field("Address", "address", "text", "Street address, building")}
              {field("City", "city", "text", "Mumbai")}
              {field("State", "state", "text", "Maharashtra")}
              {field("Pincode", "pincode", "text", "400001")}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3 p-4 bg-white/3 rounded-2xl border border-white/8">
            <input
              id="autoApprove"
              type="checkbox"
              checked={form.autoApprove}
              onChange={(e) => set("autoApprove", e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-500"
            />
            <label htmlFor="autoApprove" className="text-sm text-white/70 cursor-pointer select-none">
              <span className="font-semibold text-white">Auto-approve vendor</span>
              <span className="text-white/40 ml-1.5">— vendor can start selling immediately without review</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl text-white/50 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 gap-2 min-w-32">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Vendor</>}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function VendorsPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
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
    <>
    {showAddModal && (
      <AddVendorModal
        token={token!}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); window.location.reload(); }}
      />
    )}
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
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl h-10 bg-indigo-600 hover:bg-indigo-500 text-white gap-2 ml-auto"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </Button>
      </div>

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No vendors found</div>
        )}
      </div>
    </div>
    </>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCT_STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
  draft: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

const EMPTY_FORM = {
  name: "", sku: "", price: "", comparePrice: "", stock: "", moq: "1", unit: "piece",
  vendorId: "", categoryId: "", status: "approved", isFeatured: false,
  shortDescription: "", description: "",
};

function ProductFormModal({ open, onClose, initial, vendors, categories, token, onSaved }: {
  open: boolean; onClose: () => void; initial?: any; vendors: any[]; categories: any[];
  token: string; onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name ?? "",
          sku: initial.sku ?? "",
          price: String(initial.price ?? ""),
          comparePrice: initial.comparePrice ? String(initial.comparePrice) : "",
          stock: String(initial.stock ?? ""),
          moq: String(initial.moq ?? "1"),
          unit: initial.unit ?? "piece",
          vendorId: String(initial.vendorId ?? ""),
          categoryId: String(initial.categoryId ?? ""),
          status: initial.status ?? "approved",
          isFeatured: initial.isFeatured ?? false,
          shortDescription: initial.shortDescription ?? "",
          description: initial.description ?? "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError("");
    }
  }, [open, initial]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.vendorId || !form.categoryId || !form.price) {
      setError("Name, vendor, category, and price are required."); return;
    }
    setSaving(true); setError("");
    try {
      const url = initial ? `${BASE}/api/admin/products/${initial.id}` : `${BASE}/api/admin/products`;
      const method = initial ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name, sku: form.sku || null,
          price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          stock: Number(form.stock) || 0, moq: Number(form.moq) || 1, unit: form.unit,
          vendorId: Number(form.vendorId), categoryId: Number(form.categoryId),
          status: form.status, isFeatured: form.isFeatured,
          shortDescription: form.shortDescription || null, description: form.description || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.message || "Failed to save"); setSaving(false); return; }
      onSaved(); onClose();
    } catch {
      setError("Network error. Try again.");
    }
    setSaving(false);
  };

  if (!open) return null;

  const inputCls = "w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8";
  const selectCls = "w-full h-9 px-3 rounded-xl bg-[#111827] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50";
  const labelCls = "block text-white/50 text-[11px] font-bold uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0c1120] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-extrabold text-lg">{initial ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-white/35 text-xs mt-0.5">{initial ? `Editing: ${initial.name}` : "Create a new product in the catalog"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/12 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1: Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input className={inputCls} placeholder="e.g. Industrial Sensors 50A" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input className={inputCls} placeholder="e.g. SEN-50A-001" value={form.sku} onChange={e => set("sku", e.target.value)} />
            </div>
          </div>

          {/* Row 2: Vendor + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vendor *</label>
              <select className={selectCls} value={form.vendorId} onChange={e => set("vendorId", e.target.value)}>
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.businessName || v.email}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select className={selectCls} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Price + Compare Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input className={inputCls} type="number" min="0" placeholder="0" value={form.price} onChange={e => set("price", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Compare Price (₹)</label>
              <input className={inputCls} type="number" min="0" placeholder="MRP / original price" value={form.comparePrice} onChange={e => set("comparePrice", e.target.value)} />
            </div>
          </div>

          {/* Row 4: Stock + MOQ + Unit */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Stock</label>
              <input className={inputCls} type="number" min="0" placeholder="0" value={form.stock} onChange={e => set("stock", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>MOQ</label>
              <input className={inputCls} type="number" min="1" placeholder="1" value={form.moq} onChange={e => set("moq", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <select className={selectCls} value={form.unit} onChange={e => set("unit", e.target.value)}>
                {["piece", "kg", "litre", "meter", "box", "pack", "set", "dozen", "ton", "roll", "bundle"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Status + Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pb-0.5">
              <button
                type="button"
                onClick={() => set("isFeatured", !form.isFeatured)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? "bg-indigo-500" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-white/60 text-sm font-medium">Featured Product</span>
            </div>
          </div>

          {/* Row 6: Short description */}
          <div>
            <label className={labelCls}>Short Description</label>
            <input className={inputCls} placeholder="One-line summary for listings" value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} />
          </div>

          {/* Row 7: Description */}
          <div>
            <label className={labelCls}>Full Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 resize-none"
              rows={4} placeholder="Detailed product description…"
              value={form.description} onChange={e => set("description", e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl border-white/15 text-white/70 hover:bg-white/5 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}
              className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-0 font-bold text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Saving…" : initial ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteProductModal({ product, onClose, onDeleted, token }: {
  product: any; onClose: () => void; onDeleted: () => void; token: string;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`${BASE}/api/admin/products/${product.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(false);
    onDeleted(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c1120] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-white font-extrabold text-base text-center mb-1">Delete Product?</h3>
        <p className="text-white/40 text-sm text-center mb-5">
          "<span className="text-white/70">{product?.name}</span>" will be permanently removed.
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={deleting}
            className="flex-1 h-10 rounded-xl border-white/15 text-white/70 hover:bg-white/5 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={deleting}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-500 border-0 font-bold text-white">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductsPanel() {
  const { token } = useAdminAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);

  const { data, loading } = useAdminFetch<any>("/api/admin/products", [refresh]);
  const { data: vendorsData } = useAdminFetch<any[]>("/api/admin/vendors-list", []);
  const { data: catsData } = useAdminFetch<any[]>("/api/admin/categories", []);

  const products: any[] = data?.products ?? [];
  const vendors: any[] = vendorsData ?? [];
  const categories: any[] = catsData ?? [];

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditProduct(null); setShowForm(true); };
  const openEdit = (p: any) => { setEditProduct(p); setShowForm(true); };
  const onSaved = () => setRefresh(r => r + 1);
  const onDeleted = () => setRefresh(r => r + 1);

  const statusCounts = { all: products.length, approved: 0, pending: 0, rejected: 0, draft: 0 };
  products.forEach(p => { if (statusCounts[p.status as keyof typeof statusCounts] !== undefined) statusCounts[p.status as keyof typeof statusCounts]++; });

  return (
    <>
      <ProductFormModal
        open={showForm} onClose={() => setShowForm(false)}
        initial={editProduct} vendors={vendors} categories={categories}
        token={token || ""} onSaved={onSaved}
      />
      {deleteProduct && (
        <DeleteProductModal
          product={deleteProduct} onClose={() => setDeleteProduct(null)}
          onDeleted={onDeleted} token={token || ""}
        />
      )}

      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "approved", "pending", "rejected", "draft"] as const).map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  statusFilter === s
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-white/4 border-white/10 text-white/40 hover:bg-white/8"
                }`}
              >
                {s} <span className="ml-1 opacity-70">({statusCounts[s]})</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
                className="pl-9 h-9 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm" />
            </div>
            <Button onClick={openAdd}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 border-0 font-bold text-white text-sm flex-shrink-0">
              <Plus className="w-4 h-4 mr-1.5" /> Add Product
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/6">
                  {["Product", "Category", "Price", "Stock", "MOQ", "Status", "Featured", "Actions"].map((h) => (
                    <th key={h} className="text-left text-white/30 text-[10px] font-bold uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/4">
                      {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                    </tr>
                  ))
                  : filtered.map((p) => {
                    const catName = categories.find(c => c.id === p.categoryId)?.name || "—";
                    return (
                      <tr key={p.id} className="border-b border-white/4 hover:bg-white/[0.025] transition-colors group">
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-white/30 text-[10px] font-mono">{p.sku || `ID #${p.id}`}</p>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-sm whitespace-nowrap">{catName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-white font-bold text-sm">₹{Number(p.price).toLocaleString("en-IN")}</p>
                          {p.comparePrice && <p className="text-white/30 text-[10px] line-through">₹{Number(p.comparePrice).toLocaleString("en-IN")}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${p.stock > 100 ? "text-emerald-400" : p.stock > 0 ? "text-amber-400" : "text-red-400"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-sm">{p.moq} {p.unit}</td>
                        <td className="px-4 py-3">
                          <Badge className={`text-[10px] border capitalize ${PRODUCT_STATUS_COLORS[p.status] || "bg-white/5 text-white/40 border-white/10"}`}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {p.isFeatured ? (
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                          ) : (
                            <Star className="w-4 h-4 text-white/15" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(p)}
                              className="w-7 h-7 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 flex items-center justify-center transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              className="w-7 h-7 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 flex items-center justify-center transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-14">
              <Package className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-white/30 text-sm font-medium">No products found</p>
              <p className="text-white/20 text-xs mt-1">Try adjusting your filters or add a new product</p>
            </div>
          )}
        </div>

        <p className="text-white/25 text-xs text-right">{filtered.length} of {products.length} products</p>
      </div>
    </>
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
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
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
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No customers registered yet</div>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function CategoriesPanel() {
  const { data: cats, loading } = useAdminFetch<any[]>("/api/categories");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ name: "", description: "", icon: "" }); setEditItem(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ name: c.name, description: c.description || "", icon: c.icon || "" }); setEditItem(c); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    const url = editItem ? `/api/categories/${editItem.id}` : "/api/categories";
    const method = editItem ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    window.location.reload();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{cats?.length ?? 0} categories</p>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-semibold hover:bg-indigo-500/30 transition-all">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white/4 rounded-2xl border border-white/10 p-6 space-y-4">
          <h3 className="text-white font-bold text-sm">{editItem ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" placeholder="Electronics" />
            </div>
            <div className="space-y-1">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Icon (emoji)</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" placeholder="💻" />
            </div>
            <div className="space-y-1">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" placeholder="Optional description" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving || !form.name} className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl bg-white/5 text-white/60 text-sm font-semibold hover:bg-white/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
        </div>
      ) : cats && cats.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {cats.map((c: any) => (
            <div key={c.id} className="bg-white/3 rounded-3xl border border-white/8 p-5 hover:border-indigo-500/25 transition-all group relative">
              <div className="text-3xl mb-3">{c.icon || "📦"}</div>
              <h3 className="text-white font-bold text-sm mb-2 truncate">{c.name}</h3>
              <div className="flex gap-4 text-xs text-white/40">
                <span>{c.productCount ?? 0} products</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/8 text-white/50 hover:text-white text-xs">✏️</button>
                <button onClick={() => del(c.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
          <Tags className="w-10 h-10 text-white/15 mb-3" />
          <p className="text-white/40 text-sm">No categories yet</p>
          <button onClick={openAdd} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">Add your first category</button>
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITY LOGS ────────────────────────────────────────────────────────────
const ACTION_META: Record<string, { label: string; color: string }> = {
  vendor_approved:       { label: "Vendor Approved",       color: "bg-emerald-400" },
  vendor_rejected:       { label: "Vendor Rejected",        color: "bg-red-400" },
  vendor_suspended:      { label: "Vendor Suspended",       color: "bg-amber-400" },
  vendor_restored:       { label: "Vendor Restored",        color: "bg-blue-400" },
  product_approved:      { label: "Product Approved",       color: "bg-emerald-400" },
  product_deleted:       { label: "Product Deleted",        color: "bg-red-400" },
  order_placed:          { label: "Order Placed",           color: "bg-blue-400" },
  order_status_updated:  { label: "Order Updated",          color: "bg-indigo-400" },
};

function ActivityLogsPanel() {
  const { data: logs, loading } = useAdminFetch<any[]>("/api/admin/activity-logs");
  const [filter, setFilter] = useState("all");

  const filtered = (logs || []).filter((l: any) => filter === "all" || l.action.includes(filter));
  const filterOptions = [
    { key: "all", label: "All" },
    { key: "vendor", label: "Vendors" },
    { key: "product", label: "Products" },
    { key: "order", label: "Orders" },
  ];

  const relativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {filterOptions.map(opt => (
          <button key={opt.key} onClick={() => setFilter(opt.key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === opt.key ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-white/40 hover:text-white/60 border border-transparent"}`}>
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-white/30 text-xs">{filtered.length} events</span>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl bg-white/5" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
          <Activity className="w-10 h-10 text-white/15 mb-3" />
          <p className="text-white/40 text-sm">No activity logs yet</p>
        </div>
      ) : (
        <div className="bg-white/3 rounded-3xl border border-white/8 divide-y divide-white/5">
          {filtered.map((log: any) => {
            const meta = ACTION_META[log.action] || { label: log.action.replace(/_/g, " "), color: "bg-white/30" };
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${meta.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-semibold capitalize">{meta.label}</p>
                  {log.details && <p className="text-white/35 text-xs mt-0.5 truncate">{log.details}</p>}
                  {log.resource && <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30 uppercase tracking-wider">{log.resource}</span>}
                </div>
                <span className="text-white/25 text-xs flex-shrink-0 mt-1">{relativeTime(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
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
function ScreenshotModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors z-10">
          <X className="w-4 h-4 text-white" />
        </button>
        <img src={src} alt="Payment screenshot" className="w-full rounded-2xl border border-white/10 shadow-2xl" />
      </div>
    </div>
  );
}

function downloadAdminInvoice(order: any) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const items = (order.items || []).map((i: any) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${fmt(i.price)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${fmt(i.subtotal)}</td></tr>`
  ).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice – ${order.orderNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f8f9fa;padding:40px;color:#1a1a1a}.inv{max-width:720px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden}.hdr{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;color:#fff}.hdr h1{font-size:28px;font-weight:800;letter-spacing:-.5px}.hdr p{margin-top:4px;opacity:.8;font-size:14px}.body{padding:40px}.meta{display:flex;justify-content:space-between;margin-bottom:32px;gap:24px}.meta-block h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px}.meta-block p{font-size:14px;color:#111;font-weight:500}.table-wrap{border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px}table{width:100%;border-collapse:collapse}thead tr{background:#f3f4f6}thead th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:.5px}thead th:nth-child(n+2){text-align:center}thead th:last-child{text-align:right}.summary{margin-left:auto;width:280px}.summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#374151}.summary-row.total{border-top:2px solid #e5e7eb;margin-top:8px;padding-top:12px;font-size:16px;font-weight:800;color:#1a1a1a}.chip{display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700}.chip-paid{background:#d1fae5;color:#065f46}.chip-pending{background:#fef3c7;color:#92400e}.footer{text-align:center;padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}@media print{body{background:#fff;padding:0}.inv{box-shadow:none}}</style></head><body><div class="inv"><div class="hdr"><h1>Vendorkart</h1><p>India's #1 B2B Wholesale Marketplace</p></div><div class="body"><div class="meta"><div class="meta-block"><h3>Invoice To</h3><p>${order.customerName || "Customer #" + order.customerId}</p>${order.customerEmail ? `<p style="color:#6b7280;font-size:13px">${order.customerEmail}</p>` : ""}</div><div class="meta-block"><h3>Invoice Details</h3><p>Invoice: INV-${order.orderNumber}</p><p>Order: #${order.orderNumber}</p><p>Date: ${new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</p></div><div class="meta-block" style="text-align:right"><h3>Payment Status</h3><span class="chip chip-${order.paymentStatus === "paid" ? "paid" : "pending"}">${order.paymentStatus?.toUpperCase()}</span>${order.couponCode ? `<p style="margin-top:8px;font-size:12px;color:#6b7280">Coupon: ${order.couponCode}</p>` : ""}</div></div><div class="table-wrap"><table><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${items}</tbody></table></div><div class="summary"><div class="summary-row"><span>Subtotal</span><span>${fmt(Number(order.subtotal))}</span></div><div class="summary-row" style="color:#059669"><span>Discount${order.couponCode ? ` (${order.couponCode})` : ""}</span><span>- ${fmt(Number(order.discount || 0))}</span></div><div class="summary-row total"><span>Total Amount</span><span>${fmt(Number(order.total))}</span></div></div></div><div class="footer"><p>Thank you for your business! · Vendorkart · support@vendorkart.in</p></div></div><script>window.print()</script></body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

const ORDER_TAB_CONFIG = [
  { key: "new",        label: "New Orders",        statuses: ["pending_payment", "pending"],   color: "bg-orange-500/15 text-orange-400 border-orange-500/25", dot: "bg-orange-400" },
  { key: "processing", label: "Processing",         statuses: ["confirmed", "processing"],      color: "bg-violet-500/15 text-violet-400 border-violet-500/25", dot: "bg-violet-400" },
  { key: "shipped",    label: "Shipped",            statuses: ["shipped"],                      color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",        dot: "bg-cyan-400" },
  { key: "delivered",  label: "Delivered",          statuses: ["delivered"],                    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
  { key: "cancelled",  label: "Cancelled / Returned", statuses: ["cancelled", "refunded"],     color: "bg-red-500/15 text-red-400 border-red-500/25",          dot: "bg-red-400" },
];

const ALL_STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  pending:    "bg-amber-500/15 text-amber-400 border-amber-500/25",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  processing: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  delivered:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/25",
  refunded:   "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

function OrdersPanel() {
  const { data, loading } = useAdminFetch<any>("/api/admin/orders");
  const { token } = useAdminAuthStore();
  const [activeTab, setActiveTab] = useState("new");
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const orders: any[] = data?.orders ?? [];

  const currentTabCfg = ORDER_TAB_CONFIG.find(t => t.key === activeTab)!;
  const filtered = orders.filter(o => currentTabCfg.statuses.includes(o.status));

  const newCount = orders.filter(o => ["pending_payment", "pending"].includes(o.status)).length;

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`${BASE}/api/orders/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } finally {
      setUpdating(null);
    }
  };

  const verifyPayment = async (id: number, action: "approve" | "reject") => {
    setVerifying(id);
    try {
      await fetch(`${BASE}/api/admin/orders/${id}/verify-payment`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      window.location.reload();
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-5">
      {screenshotModal && <ScreenshotModal src={screenshotModal} onClose={() => setScreenshotModal(null)} />}

      {newCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
          <p className="text-orange-300 text-sm font-medium">
            {newCount} order{newCount > 1 ? "s" : ""} awaiting payment verification or confirmation
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {ORDER_TAB_CONFIG.map(tab => {
          const count = orders.filter(o => tab.statuses.includes(o.status)).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "text-white/50 hover:text-white/80 bg-white/3 border-white/10"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? "bg-white/20 text-white" : `${tab.dot} bg-opacity-20 text-white/70`}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/6">
                {["Order #", "Customer", "Items", "Total", "Discount", "Payment", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/4">
                    {Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                  </tr>
                ))
              ) : filtered.map(o => (
                <tr key={o.id} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${["pending_payment", "pending"].includes(o.status) ? "bg-orange-500/3" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="text-white text-sm font-mono font-bold">{o.orderNumber}</span>
                    {o.couponCode && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">{o.couponCode}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-semibold">{o.customerName || `Customer #${o.customerId}`}</p>
                      {o.customerEmail && <p className="text-white/35 text-[10px] truncate max-w-[140px]">{o.customerEmail}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{(o.items || []).length} item{(o.items || []).length !== 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 text-white font-bold text-sm">₹{Number(o.total).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {Number(o.discount) > 0 ? (
                      <span className="text-emerald-400 text-sm font-semibold">-₹{Number(o.discount).toLocaleString("en-IN")}</span>
                    ) : (
                      <span className="text-white/20 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] capitalize border ${o.paymentStatus === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : o.paymentStatus === "failed" ? "bg-red-500/15 text-red-400 border-red-500/25" : "bg-amber-500/15 text-amber-400 border-amber-500/25"}`}>{o.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] capitalize border ${ALL_STATUS_COLORS[o.status] ?? "bg-white/10 text-white/40"}`}>{o.status?.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Invoice download */}
                      <button
                        onClick={() => downloadAdminInvoice(o)}
                        className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/25 transition-colors"
                        title="Download Invoice"
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                      {/* Screenshot */}
                      {o.paymentScreenshot && (
                        <button
                          onClick={() => setScreenshotModal(o.paymentScreenshot)}
                          className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                          title="View Screenshot"
                        >
                          <ImageIcon className="w-3 h-3" />
                        </button>
                      )}
                      {/* Verify payment */}
                      {o.status === "pending_payment" ? (
                        <>
                          <button
                            onClick={() => verifyPayment(o.id, "approve")}
                            disabled={verifying === o.id}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => verifyPayment(o.id, "reject")}
                            disabled={verifying === o.id}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </>
                      ) : (
                        <select
                          onChange={e => updateStatus(o.id, e.target.value)}
                          value={o.status}
                          disabled={updating === o.id}
                          className="text-[11px] bg-white/5 border border-white/10 text-white/60 rounded-lg px-2 py-1 cursor-pointer disabled:opacity-50"
                        >
                          {["confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {currentTabCfg.label.toLowerCase()} orders</p>
          </div>
        )}
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
      <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-300 text-sm"><strong>UPI QR Payment:</strong> Customers pay via UPI QR code and submit a screenshot. Go to <strong>Orders</strong> tab to verify and approve/reject pending payments.</p>
      </div>
      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
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
        </div>
        {!loading && list.length === 0 && <div className="text-center py-12 text-white/30">No payment records yet</div>}
      </div>
    </div>
  );
}

// ─── COUPONS ──────────────────────────────────────────────────────────────────
const BLANK_COUPON = { code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "", isActive: true };

function CouponsPanel() {
  const { data: coupons, loading } = useAdminFetch<any[]>("/api/admin/coupons");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...BLANK_COUPON });
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const openCreate = () => { setEditingId(null); setForm({ ...BLANK_COUPON }); setShowForm(true); };
  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split("T")[0] : "",
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
    };
    if (editingId) {
      await fetch(`${BASE}/api/admin/coupons/${editingId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${BASE}/api/admin/coupons`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ ...BLANK_COUPON });
    window.location.reload();
  };

  const handleToggleActive = async (c: any) => {
    await fetch(`${BASE}/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`${BASE}/api/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  const list = coupons ?? [];

  const inputCls = "w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50";
  const labelCls = "text-white/50 text-xs mb-1.5 block font-semibold uppercase tracking-wider";

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-white/40 text-sm">Create and manage discount coupons. Apply them at checkout.</p>
        <Button onClick={openCreate} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/3 rounded-2xl border border-indigo-500/25 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-base">{editingId ? "Edit Coupon" : "New Coupon"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-white/8">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Code *</label>
              <input className={inputCls} value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="e.g. SAVE20" required />
            </div>
            <div>
              <label className={labelCls}>Discount Type</label>
              <select value={form.discountType} onChange={e => set("discountType", e.target.value)} className="w-full h-9 rounded-xl bg-[#111827] border border-white/10 text-white px-3 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Discount Value *</label>
              <input type="number" className={inputCls} value={form.discountValue} onChange={e => set("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 500"} required min="0" />
            </div>
            <div>
              <label className={labelCls}>Min Order Amount (₹)</label>
              <input type="number" className={inputCls} value={form.minOrderAmount} onChange={e => set("minOrderAmount", e.target.value)} placeholder="e.g. 1000" min="0" />
            </div>
            <div>
              <label className={labelCls}>Max Uses</label>
              <input type="number" className={inputCls} value={form.maxUses} onChange={e => set("maxUses", e.target.value)} placeholder="Leave blank for unlimited" min="1" />
            </div>
            <div>
              <label className={labelCls}>Expires At</label>
              <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="couponActive" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <label htmlFor="couponActive" className="text-white/60 text-sm cursor-pointer">Active (customers can use this coupon)</label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl text-white/50 h-9">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">{editingId ? "Save Changes" : "Create Coupon"}</Button>
          </div>
        </form>
      )}

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/6">
                {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/4">
                    {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
                  </tr>
                ))
              ) : list.map((c: any) => (
                <tr key={c.id} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${!c.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-white font-bold font-mono text-sm">{c.code}</td>
                  <td className="px-4 py-3 text-white/50 text-sm capitalize">{c.discountType}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold text-sm">{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${Number(c.discountValue).toLocaleString("en-IN")}`}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{c.minOrderAmount ? `₹${Number(c.minOrderAmount).toLocaleString("en-IN")}` : "—"}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{c.usedCount ?? 0}<span className="text-white/20">/{c.maxUses ?? "∞"}</span></td>
                  <td className="px-4 py-3 text-white/30 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border ${c.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" onClick={() => openEdit(c)} className="h-6 px-2 text-[10px] rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" onClick={() => handleToggleActive(c)} className={`h-6 px-2.5 text-[10px] rounded-lg border ${c.isActive ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"}`}>
                        {c.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(c.id)} className="h-6 px-2 text-[10px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && list.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Tags className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No coupons yet. Create your first discount coupon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUBSCRIPTION PLANS ────────────────────────────────────────────────────────
const BLANK_PLAN = { name: "", price: 0, billingCycle: "monthly", maxProducts: -1, maxCategories: -1, canUploadBanner: false, isFeatured: false, can360View: false, isActive: true, featuresRaw: "" };

const formatBillingCycle = (cycle: string) => {
  const map: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    half_yearly: "Half Yearly",
    yearly: "Yearly",
  };
  return map[cycle] ?? cycle.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const billingCycleColors: Record<string, string> = {
  monthly: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  quarterly: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  half_yearly: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  yearly: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

function PlanPreviewCard({ vals }: { vals: any }) {
  const cycle = vals.billingCycle || "monthly";
  const cycleColor = billingCycleColors[cycle] ?? "bg-white/10 text-white/60 border-white/20";
  const features = (vals.featuresRaw || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
      <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold mb-2">Live Preview</p>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-extrabold text-white truncate">{vals.name || <span className="text-white/20">Plan Name</span>}</p>
          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cycleColor}`}>
            {formatBillingCycle(cycle)} billing
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-extrabold text-white">
            {Number(vals.price) === 0 ? "Free" : `₹${Number(vals.price || 0).toLocaleString("en-IN")}`}
          </p>
          {Number(vals.price) > 0 && <p className="text-white/30 text-[10px]">/{formatBillingCycle(cycle).toLowerCase()}</p>}
        </div>
      </div>
      <div className="space-y-1 text-xs text-white/40">
        <p>Products: <span className="text-white/70 font-semibold">{Number(vals.maxProducts) === -1 ? "Unlimited" : vals.maxProducts}</span></p>
        <p>Categories: <span className="text-white/70 font-semibold">{Number(vals.maxCategories) === -1 ? "All" : vals.maxCategories}</span></p>
        <div className="flex gap-3 pt-0.5 flex-wrap">
          {vals.canUploadBanner && <span className="text-emerald-400">✓ Banner</span>}
          {vals.isFeatured && <span className="text-emerald-400">✓ Featured</span>}
          {vals.can360View && <span className="text-emerald-400">✓ 360° View</span>}
          {!vals.isActive && <span className="text-red-400">✗ Inactive</span>}
        </div>
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {features.slice(0, 3).map((f: string, i: number) => (
              <span key={i} className="px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 text-[10px]">{f}</span>
            ))}
            {features.length > 3 && <span className="text-white/30 text-[10px]">+{features.length - 3} more</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionPlansPanel() {
  const { data: plans, loading } = useAdminFetch<any[]>("/api/admin/subscription-plans");
  const { token } = useAdminAuthStore();
  const [editing, setEditing] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({ ...BLANK_PLAN });
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const setN = (k: string, v: any) => setNewPlan(p => ({ ...p, [k]: v }));

  const parseFeatures = (raw: string) => raw.split("\n").map(s => s.trim()).filter(Boolean);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${BASE}/api/admin/subscription-plans`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newPlan,
        price: Number(newPlan.price),
        maxProducts: Number(newPlan.maxProducts),
        maxCategories: Number(newPlan.maxCategories),
        features: parseFeatures(newPlan.featuresRaw),
      }),
    });
    if (res.ok) { setIsCreating(false); setNewPlan({ ...BLANK_PLAN }); window.location.reload(); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${BASE}/api/admin/subscription-plans/${editing.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editing,
        price: Number(editing.price),
        maxProducts: Number(editing.maxProducts),
        maxCategories: Number(editing.maxCategories),
        features: parseFeatures(editing.featuresRaw ?? (editing.features ?? []).join("\n")),
      }),
    });
    setEditing(null);
    window.location.reload();
  };

  const handleDelete = async (plan: any) => {
    setDeleteErr(null);
    const res = await fetch(`${BASE}/api/admin/subscription-plans/${plan.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { setDeleteErr(data.message); return; }
    window.location.reload();
  };

  const openEdit = (plan: any) => setEditing({
    ...plan,
    featuresRaw: (plan.features ?? []).join("\n"),
  });

  const list = plans ?? [];
  const planColors: Record<string, string> = { basic: "text-slate-400", standard: "text-blue-400", premium: "text-amber-400" };

  const PlanFormFields = ({ vals, set }: { vals: any; set: (k: string, v: any) => void }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1 block">Plan Name *</label>
          <Input value={vals.name} onChange={e => set("name", e.target.value)} placeholder="Gold, Enterprise, Starter…" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Price (₹/month, 0 = Free)</label>
          <Input type="number" min="0" value={vals.price} onChange={e => set("price", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Billing Cycle</label>
          <select value={vals.billingCycle} onChange={e => set("billingCycle", e.target.value)} className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white px-3 text-sm">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Max Products (-1 = unlimited)</label>
          <Input type="number" value={vals.maxProducts} onChange={e => set("maxProducts", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Max Categories (-1 = all)</label>
          <Input type="number" value={vals.maxCategories} onChange={e => set("maxCategories", e.target.value)} className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
        </div>
        <div className="col-span-2">
          <label className="text-white/50 text-xs mb-1 block">Feature Bullet Points (one per line)</label>
          <textarea value={vals.featuresRaw ?? ""} onChange={e => set("featuresRaw", e.target.value)} rows={3} placeholder={"Priority support\nCustom store URL\nAnalytics dashboard"} className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex gap-5 flex-wrap">
        {[["canUploadBanner", "Banner Upload"], ["isFeatured", "Featured Listing"], ["can360View", "360° View"], ["isActive", "Active"]].map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
            <input type="checkbox" checked={!!vals[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4" />
            {l}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 flex-1 mr-4">
          <CreditCard className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <p className="text-indigo-300 text-sm"><strong>Razorpay Payments:</strong> Under Development — vendors can subscribe to the free Basic plan. Paid plans will activate once Razorpay is live.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9 flex-shrink-0">
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      {deleteErr && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/8 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{deleteErr}</p>
          <button onClick={() => setDeleteErr(null)} className="ml-auto text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl bg-white/5" />) :
          list.map((plan: any) => (
            <div key={plan.id} className={`bg-white/3 rounded-2xl border p-6 space-y-3 ${plan.isActive ? "border-white/8" : "border-white/4 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-extrabold capitalize truncate ${planColors[plan.slug] ?? "text-white"}`}>{plan.name}</p>
                    {!plan.isActive && <Badge className="text-[10px] bg-white/5 text-white/30 border border-white/10 flex-shrink-0">Inactive</Badge>}
                  </div>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${billingCycleColors[plan.billingCycle] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                    {formatBillingCycle(plan.billingCycle)} billing
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-white flex-shrink-0">{Number(plan.price) === 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}</p>
              </div>
              <div className="space-y-1.5 text-xs text-white/50">
                <p>Max Products: <span className="text-white font-semibold">{plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts}</span></p>
                <p>Max Categories: <span className="text-white font-semibold">{plan.maxCategories === -1 ? "All" : plan.maxCategories}</span></p>
                <p>Banner Upload: <span className={`font-semibold ${plan.canUploadBanner ? "text-emerald-400" : "text-red-400"}`}>{plan.canUploadBanner ? "Yes" : "No"}</span></p>
                <p>Featured Listing: <span className={`font-semibold ${plan.isFeatured ? "text-emerald-400" : "text-red-400"}`}>{plan.isFeatured ? "Yes" : "No"}</span></p>
                <p>360° View: <span className={`font-semibold ${plan.can360View ? "text-emerald-400" : "text-red-400"}`}>{plan.can360View ? "Yes" : "No"}</span></p>
                {plan.features?.length > 0 && (
                  <p>Features: <span className="text-white/60">{plan.features.length} bullet{plan.features.length !== 1 ? "s" : ""}</span></p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => openEdit(plan)} size="sm" className="flex-1 rounded-xl h-8 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20">
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button onClick={() => handleDelete(plan)} size="sm" className="h-8 px-3 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsCreating(false)} />
          <form onSubmit={handleCreate} className="relative bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Create New Plan</h3>
              <button type="button" onClick={() => setIsCreating(false)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
            </div>
            <PlanFormFields vals={newPlan} set={setN} />
            <PlanPreviewCard vals={newPlan} />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="rounded-xl text-white/50 h-9">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">Create Plan</Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <form onSubmit={handleUpdate} className="relative bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Edit Plan: {editing.name}</h3>
              <button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
            </div>
            <PlanFormFields vals={editing} set={(k, v) => setEditing((p: any) => ({ ...p, [k]: v }))} />
            <PlanPreviewCard vals={editing} />
            <div className="flex gap-3 justify-end pt-2">
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

// ─── CONTACT INFO ─────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "mail", label: "Mail" },
  { value: "mapPin", label: "Map Pin" },
  { value: "clock", label: "Clock" },
  { value: "building2", label: "Building" },
  { value: "messageSquare", label: "Message" },
];
const COLOR_OPTIONS = [
  { value: "from-blue-500 to-indigo-600", label: "Blue / Indigo" },
  { value: "from-violet-500 to-purple-600", label: "Violet / Purple" },
  { value: "from-emerald-500 to-teal-600", label: "Emerald / Teal" },
  { value: "from-amber-500 to-orange-500", label: "Amber / Orange" },
  { value: "from-rose-500 to-pink-600", label: "Rose / Pink" },
  { value: "from-cyan-500 to-blue-600", label: "Cyan / Blue" },
];

const BLANK_FORM = { iconType: "phone", title: "", line1: "", line2: "", sub: "", color: "from-blue-500 to-indigo-600", sortOrder: 0, isActive: true };

function ContactInfoPanel() {
  const { data: items, loading } = useAdminFetch<any[]>("/api/admin/contact-info");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<typeof BLANK_FORM>({ ...BLANK_FORM });
  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => { setEditing(null); setForm({ ...BLANK_FORM }); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ iconType: item.iconType, title: item.title, line1: item.line1, line2: item.line2 ?? "", sub: item.sub ?? "", color: item.color, sortOrder: item.sortOrder, isActive: item.isActive });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, line2: form.line2 || null, sub: form.sub || null };
    if (editing) {
      await fetch(`${BASE}/api/admin/contact-info/${editing.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`${BASE}/api/admin/contact-info`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact card?")) return;
    await fetch(`${BASE}/api/admin/contact-info/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  const handleToggle = async (item: any) => {
    await fetch(`${BASE}/api/admin/contact-info/${item.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isActive: !item.isActive }),
    });
    window.location.reload();
  };

  const list = items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-white/60 text-sm">Manage the contact info cards shown on the public Contact page.</p>
        <Button onClick={openCreate} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9">
          <Plus className="w-4 h-4" /> Add Card
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/3 rounded-2xl border border-indigo-500/25 p-6 space-y-4">
          <h3 className="text-white font-bold">{editing ? "Edit Card" : "New Contact Card"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Icon</label>
              <select value={form.iconType} onChange={e => setF("iconType", e.target.value)} className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white px-3 text-sm">
                {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Color</label>
              <select value={form.color} onChange={e => setF("color", e.target.value)} className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white px-3 text-sm">
                {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-white/50 text-xs mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="Call Us" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Line 1 *</label>
              <Input value={form.line1} onChange={e => setF("line1", e.target.value)} placeholder="+91 98765 43210" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Line 2 (optional)</label>
              <Input value={form.line2} onChange={e => setF("line2", e.target.value)} placeholder="+91 80000 12345" className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Subtitle (optional)</label>
              <Input value={form.sub} onChange={e => setF("sub", e.target.value)} placeholder="Mon–Sat, 9 AM – 7 PM" className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Sort Order</label>
              <Input type="number" value={form.sortOrder} onChange={e => setF("sortOrder", Number(e.target.value))} className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ciActive" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="w-4 h-4" />
            <label htmlFor="ciActive" className="text-white/60 text-sm cursor-pointer">Active (visible on site)</label>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-xl text-white/50 h-9">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9">{editing ? "Save Changes" : "Create Card"}</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/3 rounded-3xl border border-white/8">
          <Phone className="w-10 h-10 text-white/15 mb-3" />
          <p className="text-white/40 text-sm">No contact cards yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item: any) => (
            <div key={item.id} className={`bg-white/3 rounded-2xl border p-5 flex items-center gap-4 ${item.isActive ? "border-indigo-500/20" : "border-white/8"}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <Badge className={`text-[10px] border flex-shrink-0 ${item.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-white/5 text-white/30 border-white/10"}`}>{item.isActive ? "Live" : "Hidden"}</Badge>
                </div>
                <p className="text-white/60 text-xs mt-0.5">{item.line1}{item.line2 ? ` · ${item.line2}` : ""}</p>
                {item.sub && <p className="text-white/30 text-xs mt-0.5">{item.sub}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => openEdit(item)} className="h-7 px-2 text-[11px] rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" onClick={() => handleToggle(item)} className={`h-7 px-3 text-[11px] rounded-lg border ${item.isActive ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"}`}>
                  {item.isActive ? "Hide" : "Show"}
                </Button>
                <Button size="sm" onClick={() => handleDelete(item.id)} className="h-7 px-2 text-[11px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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

// ─── SUBSCRIPTION PAYMENTS ───────────────────────────────────────────────────
function SubscriptionPaymentsPanel() {
  const { data, loading } = useAdminFetch<any[]>("/api/admin/subscription-payments");
  const { token } = useAdminAuthStore();
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending_verification");
  const [rejectModal, setRejectModal] = useState<{ id: number; businessName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  const list: any[] = data ?? [];
  const filtered = statusFilter === "all" ? list : list.filter((s) => s.status === statusFilter);
  const pendingCount = list.filter((s) => s.status === "pending_verification").length;

  const handleVerify = async (id: number, action: "approve" | "reject", reason?: string) => {
    setProcessing(id);
    await fetch(`${BASE}/api/admin/subscription-payments/${id}/verify`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    setProcessing(null);
    setRejectModal(null);
    setRejectReason("");
    window.location.reload();
  };

  const statusColor = (s: string) => ({
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    pending_verification: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    rejected: "bg-red-500/15 text-red-400 border-red-500/25",
    expired: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  })[s] ?? "bg-white/10 text-white/40";

  const statusLabel = (s: string) => ({
    active: "Activated",
    pending_verification: "Pending",
    rejected: "Rejected",
    expired: "Expired",
  })[s] ?? s;

  return (
    <div className="space-y-5">
      {screenshotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setScreenshotModal(null)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={screenshotModal} alt="Payment screenshot" className="w-full rounded-2xl border border-white/10 shadow-2xl object-contain max-h-[80vh]" />
            <button onClick={() => setScreenshotModal(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 border border-white/20 hover:bg-black/80 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#080c14] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">Reject Payment</h3>
            <p className="text-white/50 text-sm">Rejecting payment for <span className="text-white font-semibold">{rejectModal.businessName}</span>.</p>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Rejection Reason</label>
              <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Screenshot unclear, amount mismatch"
                className="bg-white/5 border-white/10 text-white rounded-xl h-9" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setRejectModal(null); setRejectReason(""); }} className="rounded-xl text-white/50 h-9">Cancel</Button>
              <Button onClick={() => handleVerify(rejectModal.id, "reject", rejectReason)} disabled={!!processing}
                className="rounded-xl bg-red-600 hover:bg-red-700 h-9 text-white">
                {processing === rejectModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm font-semibold">{pendingCount} subscription payment{pendingCount > 1 ? "s" : ""} awaiting verification</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { key: "pending_verification", label: "Pending" },
          { key: "active", label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "all", label: "All" },
        ].map(f => (
          <Button key={f.key} size="sm" variant={statusFilter === f.key ? "default" : "ghost"}
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-xl text-xs h-9 ${statusFilter === f.key ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white/80"}`}>
            {f.label}
            {f.key === "pending_verification" && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">{pendingCount}</span>
            )}
          </Button>
        ))}
      </div>

      <div className="bg-white/3 rounded-3xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-white/6">
              {["Vendor", "Plan", "UTR / Txn ID", "Amount Paid", "Screenshot", "Submitted", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-white/30 text-[11px] font-bold uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-white/4">
                {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 rounded bg-white/5" /></td>)}
              </tr>
            )) : filtered.map((s: any) => (
              <tr key={s.id} className={`border-b border-white/4 hover:bg-white/2 transition-colors ${s.status === "pending_verification" ? "bg-amber-500/2" : ""}`}>
                <td className="px-4 py-3">
                  <p className="text-white text-sm font-semibold">{s.vendor?.businessName ?? `Vendor #${s.vendorId}`}</p>
                  <p className="text-white/30 text-[10px]">{s.vendor?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white/80 text-sm font-semibold capitalize">{s.plan?.name ?? `Plan #${s.planId}`}</span>
                  <p className="text-white/30 text-[10px]">₹{Number(s.plan?.price ?? 0).toLocaleString("en-IN")}/mo</p>
                </td>
                <td className="px-4 py-3">
                  {s.utrNumber ? (
                    <span className="font-mono text-white/80 text-xs bg-white/5 px-2 py-1 rounded-lg">{s.utrNumber}</span>
                  ) : <span className="text-white/20 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {s.paidAmount != null ? (
                    <span className="text-emerald-400 font-bold text-sm">₹{Number(s.paidAmount).toLocaleString("en-IN")}</span>
                  ) : <span className="text-white/20 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  {s.paymentScreenshot ? (
                    <button onClick={() => setScreenshotModal(s.paymentScreenshot)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-[11px] font-semibold hover:bg-indigo-500/25 transition-colors">
                      <Eye className="w-3 h-3" /> View
                    </button>
                  ) : <span className="text-white/20 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge className={`text-[10px] border capitalize ${statusColor(s.status)}`}>{statusLabel(s.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  {s.status === "pending_verification" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" disabled={processing === s.id}
                        onClick={() => handleVerify(s.id, "approve")}
                        className="h-7 px-3 text-[11px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25">
                        {processing === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                      </Button>
                      <Button size="sm" disabled={!!processing}
                        onClick={() => setRejectModal({ id: s.id, businessName: s.vendor?.businessName ?? `Vendor #${s.vendorId}` })}
                        className="h-7 px-3 text-[11px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        Reject
                      </Button>
                    </div>
                  )}
                  {s.status === "rejected" && s.rejectionReason && (
                    <p className="text-white/30 text-[10px] max-w-[120px] truncate" title={s.rejectionReason}>{s.rejectionReason}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-white/30">No subscription payments found</div>
        )}
      </div>
    </div>
  );
}

// ─── SOCIAL LINKS ─────────────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/yourpage", color: "text-blue-400" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://x.com/yourhandle", color: "text-sky-400" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourprofile", color: "text-pink-400" },
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/yourco", color: "text-blue-500" },
  { key: "youtube",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel", color: "text-red-400" },
  { key: "whatsapp",  label: "WhatsApp",  placeholder: "https://wa.me/919876543210", color: "text-emerald-400" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/yourprofile", color: "text-rose-400" },
  { key: "telegram",  label: "Telegram",  placeholder: "https://t.me/yourchannel", color: "text-cyan-400" },
] as const;

function SocialLinksPanel() {
  const { data, loading } = useAdminFetch<any>("/api/admin/social-links");
  const { token } = useAdminAuthStore();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      const initial: Record<string, string> = {};
      SOCIAL_PLATFORMS.forEach(p => { initial[p.key] = data[p.key] ?? ""; });
      setForm(initial);
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, string | null> = {};
    SOCIAL_PLATFORMS.forEach(p => { payload[p.key] = form[p.key]?.trim() || null; });
    await fetch(`${BASE}/api/admin/social-links`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <p className="text-white/60 text-sm">Set the URLs for your social media profiles. These will appear in the site footer. Leave blank to hide a platform.</p>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl bg-white/5" />)}</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6 space-y-4">
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.key}>
                <label className={`text-xs font-semibold mb-1.5 block ${p.color}`}>{p.label}</label>
                <Input
                  type="url"
                  value={form[p.key] ?? ""}
                  onChange={e => setForm(prev => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  className="bg-white/5 border-white/10 text-white rounded-xl h-9 placeholder:text-white/20"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Social Links"}
            </Button>
            {saved && <span className="text-emerald-400 text-sm font-medium">Saved!</span>}
          </div>
        </form>
      )}
    </div>
  );
}

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const BLANK_MEMBER = {
  name: "",
  position: "",
  description: "",
  imageUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  githubUrl: "",
  instagramUrl: "",
  displayOrder: 0,
  isVisible: true,
};

function TeamMemberForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof BLANK_MEMBER;
  onSave: (data: typeof BLANK_MEMBER) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...initial });
  const [imagePreview, setImagePreview] = useState(initial.imageUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const setF = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setF("imageUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/3 rounded-2xl border border-indigo-500/25 p-6 space-y-5">
      <h3 className="text-white font-bold text-base">{initial.name ? "Edit Team Member" : "Add Team Member"}</h3>

      {/* Image Upload */}
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer relative group"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${AVATAR_GRADIENTS[0]} flex items-center justify-center text-white font-extrabold text-xl`}>
                {form.name ? getInitials(form.name) : <UserCircle2 className="w-8 h-8 opacity-50" />}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 w-full text-center">
            {imagePreview ? "Change" : "Upload"}
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Name *</label>
              <Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Arjun Kapoor" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Position / Role *</label>
              <Input value={form.position} onChange={e => setF("position", e.target.value)} placeholder="Co-Founder & CEO" className="bg-white/5 border-white/10 text-white rounded-xl h-9" required />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Image URL <span className="text-white/25">(or upload above)</span></label>
            <Input
              value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
              onChange={e => { setF("imageUrl", e.target.value); setImagePreview(e.target.value); }}
              placeholder="https://example.com/photo.jpg"
              className="bg-white/5 border-white/10 text-white rounded-xl h-9"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-white/50 text-xs mb-1 block">Short Description</label>
        <textarea
          value={form.description}
          onChange={e => setF("description", e.target.value)}
          placeholder="Brief bio or role summary..."
          rows={2}
          className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-indigo-500/50 placeholder:text-white/20"
        />
      </div>

      {/* Social Links */}
      <div>
        <label className="text-white/50 text-xs mb-2 block">Social Links <span className="text-white/25">(optional)</span></label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <Input value={form.linkedinUrl} onChange={e => setF("linkedinUrl", e.target.value)} placeholder="LinkedIn URL" className="bg-white/5 border-white/10 text-white rounded-xl h-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Twitter className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <Input value={form.twitterUrl} onChange={e => setF("twitterUrl", e.target.value)} placeholder="Twitter/X URL" className="bg-white/5 border-white/10 text-white rounded-xl h-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-white/50 flex-shrink-0" />
            <Input value={form.githubUrl} onChange={e => setF("githubUrl", e.target.value)} placeholder="GitHub URL" className="bg-white/5 border-white/10 text-white rounded-xl h-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
            <Input value={form.instagramUrl} onChange={e => setF("instagramUrl", e.target.value)} placeholder="Instagram URL" className="bg-white/5 border-white/10 text-white rounded-xl h-8 text-xs" />
          </div>
        </div>
      </div>

      {/* Display Order & Visibility */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-white/50 text-xs">Display Order</label>
          <input
            type="number"
            min={0}
            value={form.displayOrder}
            onChange={e => setF("displayOrder", Number(e.target.value))}
            className="w-16 h-8 rounded-lg bg-white/5 border border-white/10 text-white text-sm px-2 text-center"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="memberVisible" checked={form.isVisible} onChange={e => setF("isVisible", e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="memberVisible" className="text-white/60 text-sm cursor-pointer">Visible on site</label>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl text-white/50 h-9">Cancel</Button>
        <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-9 gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {initial.name ? "Save Changes" : "Add Member"}
        </Button>
      </div>
    </form>
  );
}

function TeamPanel() {
  const { data: members, loading, refetch } = useAdminFetch<any[]>("/api/admin/team-members");
  const { token } = useAdminAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (members) setList(members);
  }, [members]);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const handleCreate = async (data: any) => {
    setSaving(true);
    await fetch(`${BASE}/api/admin/team-members`, { method: "POST", headers, body: JSON.stringify(data) });
    setSaving(false);
    setShowForm(false);
    window.location.reload();
  };

  const handleEdit = async (data: any) => {
    if (editingId == null) return;
    setSaving(true);
    await fetch(`${BASE}/api/admin/team-members/${editingId}`, { method: "PUT", headers, body: JSON.stringify(data) });
    setSaving(false);
    setEditingId(null);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${BASE}/api/admin/team-members/${id}`, { method: "DELETE", headers });
    setDeleteConfirm(null);
    window.location.reload();
  };

  const handleToggleVisibility = async (m: any) => {
    await fetch(`${BASE}/api/admin/team-members/${m.id}`, {
      method: "PUT", headers,
      body: JSON.stringify({ isVisible: !m.isVisible }),
    });
    window.location.reload();
  };

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const idx = list.findIndex(m => m.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === list.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newList = [...list];
    const aOrder = newList[idx].displayOrder;
    const bOrder = newList[swapIdx].displayOrder;
    newList[idx] = { ...newList[idx], displayOrder: bOrder };
    newList[swapIdx] = { ...newList[swapIdx], displayOrder: aOrder };
    setList([...newList].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id));
    await Promise.all([
      fetch(`${BASE}/api/admin/team-members/${newList[idx].id}`, { method: "PUT", headers, body: JSON.stringify({ displayOrder: bOrder }) }),
      fetch(`${BASE}/api/admin/team-members/${newList[swapIdx].id}`, { method: "PUT", headers, body: JSON.stringify({ displayOrder: aOrder }) }),
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-white/60 text-sm">Manage the "Meet Our Team" section on the About page.</p>
        <Button onClick={() => { setShowForm(true); setEditingId(null); }} className="rounded-xl gap-2 bg-indigo-600 hover:bg-indigo-700 h-9">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      {showForm && editingId == null && (
        <TeamMemberForm
          initial={{ ...BLANK_MEMBER, displayOrder: (list.length) }}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/3 rounded-3xl border border-white/8">
          <UserCircle2 className="w-12 h-12 text-white/15 mb-3" />
          <p className="text-white/40 text-sm font-medium">No team members yet</p>
          <p className="text-white/25 text-xs mt-1">Add your first team member to show on the About page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m: any, idx: number) => (
            <div key={m.id}>
              {editingId === m.id ? (
                <TeamMemberForm
                  initial={{
                    name: m.name, position: m.position, description: m.description || "",
                    imageUrl: m.imageUrl || "", linkedinUrl: m.linkedinUrl || "",
                    twitterUrl: m.twitterUrl || "", githubUrl: m.githubUrl || "",
                    instagramUrl: m.instagramUrl || "", displayOrder: m.displayOrder, isVisible: m.isVisible,
                  }}
                  onSave={handleEdit}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div className={`bg-white/3 rounded-2xl border p-4 flex items-center gap-4 ${m.isVisible ? "border-indigo-500/20" : "border-white/8 opacity-60"}`}>
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-extrabold text-lg`}>
                        {getInitials(m.name)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{m.name}</p>
                      <Badge className={`text-[10px] border flex-shrink-0 ${m.isVisible ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-white/5 text-white/30 border-white/10"}`}>
                        {m.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="text-indigo-400 text-xs mt-0.5">{m.position}</p>
                    {m.description && <p className="text-white/35 text-xs mt-1 line-clamp-1">{m.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      {m.linkedinUrl && <Linkedin className="w-3 h-3 text-blue-400" />}
                      {m.twitterUrl && <Twitter className="w-3 h-3 text-sky-400" />}
                      {m.githubUrl && <Github className="w-3 h-3 text-white/40" />}
                      {m.instagramUrl && <Instagram className="w-3 h-3 text-pink-400" />}
                      <span className="text-white/20 text-[10px] ml-auto">Order: {m.displayOrder}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => handleReorder(m.id, "up")} disabled={idx === 0}
                        className="h-7 w-7 p-0 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/8 disabled:opacity-20">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" onClick={() => handleReorder(m.id, "down")} disabled={idx === list.length - 1}
                        className="h-7 w-7 p-0 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/8 disabled:opacity-20">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => handleToggleVisibility(m)}
                        className={`h-7 px-2 text-[11px] rounded-lg border ${m.isVisible ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"}`}>
                        {m.isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" onClick={() => { setEditingId(m.id); setShowForm(false); }}
                        className="h-7 px-2 text-[11px] rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" onClick={() => setDeleteConfirm(m.id)}
                        className="h-7 px-2 text-[11px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete confirm */}
              {deleteConfirm === m.id && (
                <div className="mt-2 bg-red-500/8 border border-red-500/25 rounded-xl p-4 flex items-center gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-white/70 text-sm flex-1">Delete <strong className="text-white">{m.name}</strong>? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)} className="h-7 rounded-lg text-white/40 text-xs">Cancel</Button>
                    <Button size="sm" onClick={() => handleDelete(m.id)} className="h-7 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs">Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
  "/admin/subscription-payments": { title: "Subscription Payments", component: SubscriptionPaymentsPanel },
  "/admin/commission": { title: "Commission Settings", component: CommissionPanel },
  "/admin/banners": { title: "Banner & Ads Management", component: BannersPanel },
  "/admin/contact-info": { title: "Contact Info Cards", component: ContactInfoPanel },
  "/admin/social-links": { title: "Social Media Links", component: SocialLinksPanel },
  "/admin/team": { title: "Team Members", component: TeamPanel },
  "/admin/emails": { title: "Email System", component: EmailLogsPanel },
  "/admin/contact": { title: "Contact Messages", component: ContactMessagesPanel },
  "/admin/activity": { title: "Activity Logs", component: ActivityLogsPanel },
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
