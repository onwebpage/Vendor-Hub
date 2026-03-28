import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Star, MapPin, Package, Phone, BadgeCheck, ArrowLeft, Store, ShoppingBag } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetVendorBySlug } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function VendorStore() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetVendorBySlug(slug!);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="animate-pulse">
          <Skeleton className="h-64 w-full rounded-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data?.vendor) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Vendor not found</h2>
          <p className="text-muted-foreground mb-8">This store doesn't exist or has been removed.</p>
          <Button asChild><Link href="/vendors"><ArrowLeft className="mr-2 w-4 h-4" /> Back to Vendors</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const { vendor, products = [], reviews = [] } = data;
  const rating = vendor.rating ? parseFloat(String(vendor.rating)) : 0;
  const initials = vendor.businessName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <PublicLayout>
      {/* Banner */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        {vendor.banner && (
          <img src={vendor.banner} alt={vendor.businessName} className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />

        <div className="absolute top-4 left-4">
          <Link href="/vendors">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> All Vendors
            </Button>
          </Link>
        </div>
      </div>

      {/* Vendor header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10 relative z-10">
            {/* Logo */}
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="w-20 h-20 rounded-2xl border-4 border-background object-cover shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl flex-shrink-0">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold text-foreground">{vendor.businessName}</h1>
                <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                {vendor.isFeatured && (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-[10px]">Featured</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {(vendor.city || vendor.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                    <span>({vendor.reviewCount} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {vendor.productCount || products.length} Products
                </span>
                {vendor.gstNumber && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <BadgeCheck className="w-3.5 h-3.5" /> GST Verified
                  </span>
                )}
              </div>
            </div>

            <div className="sm:ml-auto flex-shrink-0">
              <Button className="rounded-xl" asChild>
                <Link href="/products">
                  <ShoppingBag className="mr-2 w-4 h-4" /> Browse Products
                </Link>
              </Button>
            </div>
          </div>

          {vendor.description && (
            <p className="text-muted-foreground text-sm mt-5 max-w-3xl leading-relaxed">{vendor.description}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-bold text-foreground">
              Products by {vendor.businessName}
            </h2>
            <span className="text-sm text-muted-foreground">{products.length} listed</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <ProductCard product={{
                    ...product,
                    vendorName: vendor.businessName,
                    vendorSlug: vendor.slug,
                    price: parseFloat(product.price),
                    rating: product.rating ? parseFloat(product.rating) : 0,
                  }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="bg-muted/30 border-t border-border/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-display font-bold text-foreground mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r: any) => (
                <div key={r.id} className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.customerName?.slice(0, 2)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.customerName ?? "Anonymous"}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
