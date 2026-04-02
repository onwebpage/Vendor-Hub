import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Package, Plus, Trash2, AlertCircle, ImageOff, Search,
  CheckCircle2, Clock, XCircle, Loader2, MoreVertical,
  Edit, LayoutGrid, List, TrendingUp, IndianRupee, Boxes,
  Sparkles, ArrowUpRight, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchMyProducts() {
  const token = localStorage.getItem("vendorkart_token");
  const res = await fetch(`${API}/api/vendors/my-products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

async function deleteProduct(id: number) {
  const token = localStorage.getItem("vendorkart_token");
  const res = await fetch(`${API}/api/products/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; pill: string; dot: string }> = {
  approved: {
    label: "Live",
    icon: CheckCircle2,
    pill: "text-emerald-700 bg-emerald-500/15 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Under Review",
    icon: Clock,
    pill: "text-amber-700 bg-amber-500/15 border-amber-500/25",
    dot: "bg-amber-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    pill: "text-red-700 bg-red-500/15 border-red-500/25",
    dot: "bg-red-500",
  },
  draft: {
    label: "Draft",
    icon: Edit,
    pill: "text-muted-foreground bg-muted border-border",
    dot: "bg-muted-foreground/40",
  },
};

const filterTabs = ["All", "Live", "Under Review", "Rejected"] as const;
type FilterTab = typeof filterTabs[number];

function StatCard({ label, value, icon: Icon, gradient, delay }: {
  label: string; value: string | number; icon: React.ElementType; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border p-5 ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground/55 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
        <div className="p-2.5 bg-white/25 dark:bg-white/10 rounded-xl backdrop-blur-sm">
          <Icon className="w-5 h-5 text-foreground/70" />
        </div>
      </div>
      <ArrowUpRight className="absolute bottom-4 right-4 w-4 h-4 text-foreground/20" />
    </motion.div>
  );
}

function ProductCard({ product, onDelete, delay }: { product: any; onDelete: (id: number) => void; delay: number }) {
  const status = statusConfig[product.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const hasImage = product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group relative bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-muted/60 to-muted/20 overflow-hidden">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.classList.add("no-image");
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <ImageOff className="w-8 h-8" />
              <span className="text-[10px] font-medium">No image</span>
            </div>
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status dot top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-2.5 py-1">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${product.status === "pending" ? "animate-pulse" : ""}`} />
          <span className="text-[10px] font-semibold text-white">{status.label}</span>
        </div>

        {/* Actions top-right */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-7 w-7 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md border-0 text-white shadow-none">
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(product.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-semibold text-sm leading-snug line-clamp-2 mb-3">{product.name}</p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</p>
            {product.comparePrice && (
              <p className="text-xs text-muted-foreground line-through">₹{Number(product.comparePrice).toLocaleString("en-IN")}</p>
            )}
          </div>
          {parseFloat(String(product.rating || "0")) > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {parseFloat(String(product.rating)).toFixed(1)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground font-medium">Stock</p>
            <p className="text-xs font-bold text-foreground">{product.stock ?? "—"}</p>
          </div>
          <div className="bg-muted/50 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground font-medium">Min. Order</p>
            <p className="text-xs font-bold text-foreground">{product.moq ?? 1} {product.unit || "pcs"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductRow({ product, onDelete }: { product: any; onDelete: (id: number) => void }) {
  const status = statusConfig[product.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex-shrink-0 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-4 h-4 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Stock: {product.stock ?? "—"} · MOQ: {product.moq ?? 1} {product.unit || "pcs"}</p>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${status.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>
      <p className="font-bold text-sm text-primary min-w-[90px] text-right flex-shrink-0">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(product.id)}>
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function VendorProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("All");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-my-products"],
    queryFn: fetchMyProducts,
  });

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["vendor-my-products"] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Could not delete product", variant: "destructive" }),
  });

  const liveCount = products.filter((p: any) => p.status === "approved").length;
  const pendingCount = products.filter((p: any) => p.status === "pending").length;
  const totalRevenue = products.reduce((acc: number, p: any) => acc + (p.status === "approved" ? Number(p.price) * (p.stock || 0) : 0), 0);

  const filtered = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "All") return matchesSearch;
    const statusLabel = (statusConfig[p.status] || statusConfig.draft).label;
    return matchesSearch && statusLabel === activeFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Catalog</p>
            </div>
            <h2 className="text-3xl font-bold font-display tracking-tight">My Products</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {products.length} product{products.length !== 1 ? "s" : ""} in your store
            </p>
          </div>
          <Link href="/vendor-dashboard/add-product">
            <Button className="gap-2 rounded-xl h-11 px-5 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Products" value={products.length} icon={Boxes} gradient="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/15" delay={0} />
            <StatCard label="Live Now" value={liveCount} icon={Sparkles} gradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/15" delay={0.05} />
            <StatCard label="Under Review" value={pendingCount} icon={Clock} gradient="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/15" delay={0.1} />
            <StatCard label="Stock Value (₹)" value={totalRevenue > 0 ? `${(parseFloat(String(totalRevenue)) / 100000).toFixed(1)}L` : "—"} icon={IndianRupee} gradient="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/15" delay={0.15} />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl h-10 bg-muted/40 border-border/40 focus:bg-background"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeFilter === tab
                    ? "bg-background text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-foreground border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-background shadow-sm text-foreground border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/30">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-8 rounded-lg" />
                    <Skeleton className="h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive/70" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Couldn't load products</p>
              <p className="text-sm text-muted-foreground mt-1">Please refresh the page to try again.</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-5"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
                <Package className="w-10 h-10 text-primary/40" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="text-center max-w-xs">
              <p className="font-bold text-foreground text-xl mb-1">
                {search || activeFilter !== "All" ? "No matching products" : "Your catalog is empty"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {search || activeFilter !== "All"
                  ? "Try adjusting your search or filters."
                  : "List your products and start reaching thousands of B2B buyers on Vendorkart."}
              </p>
            </div>
            {!search && activeFilter === "All" && (
              <Link href="/vendor-dashboard/add-product">
                <Button className="gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Add Your First Product
                </Button>
              </Link>
            )}
          </motion.div>
        )}

        {/* Products grid/list */}
        <AnimatePresence mode="wait">
          {!isLoading && !isError && filtered.length > 0 && viewMode === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} onDelete={setDeleteId} delay={i * 0.04} />
              ))}
            </motion.div>
          )}

          {!isLoading && !isError && filtered.length > 0 && viewMode === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border/40 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 px-5 py-3 border-b border-border/40 bg-muted/30">
                <div className="w-12 flex-shrink-0" />
                <p className="flex-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Product</p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28 flex-shrink-0">Status</p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-right flex-shrink-0">Price</p>
                <div className="w-8 flex-shrink-0" />
              </div>
              {filtered.map((product: any) => (
                <ProductRow key={product.id} product={product} onDelete={setDeleteId} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-destructive/10 rounded-xl">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your store and will no longer be visible to buyers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 gap-2"
              onClick={() => deleteId && doDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
