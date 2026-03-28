import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, Plus, Trash2, AlertCircle, ImageOff, Search, Filter, CheckCircle2, Clock, XCircle, Loader2, MoreVertical, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  approved: { label: "Live", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-500/10 border-red-500/20" },
  draft: { label: "Draft", icon: Edit, color: "text-muted-foreground bg-muted border-border" },
};

export default function VendorProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["vendor-my-products"],
    queryFn: fetchMyProducts,
  });

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ["vendor-my-products"] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Could not delete product", variant: "destructive" }),
  });

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display">Products</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage all products in your store</p>
          </div>
          <Link href="/vendor-dashboard/add-product">
            <Button className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <AlertCircle className="w-10 h-10 text-destructive/60" />
            <p>Failed to load products. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
            <div className="p-5 bg-muted/40 rounded-full">
              <Package className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">No products yet</p>
              <p className="text-sm mt-1">Add your first product to start selling on Vendorkart</p>
            </div>
            <Link href="/vendor-dashboard/add-product">
              <Button className="gap-2 rounded-xl mt-2">
                <Plus className="w-4 h-4" /> Add First Product
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product: any, i: number) => {
              const status = statusConfig[product.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video bg-muted/40 flex items-center justify-center overflow-hidden relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <ImageOff className="w-8 h-8 text-muted-foreground/30" />
                    )}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(product.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                        <StatusIcon className="w-3 h-3" /> {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stock: <b className="text-foreground">{product.stock ?? "—"}</b></span>
                      <span>MOQ: <b className="text-foreground">{product.moq ?? 1}</b></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && doDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
