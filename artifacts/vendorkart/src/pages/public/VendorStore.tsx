import { useParams, Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, MapPin, Package, Phone, BadgeCheck, ArrowLeft,
  Store, ShoppingBag, Mail, MessageSquare, Globe, X,
  Building2, Tag, Calendar, Award,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetVendorBySlug } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function InquiryModal({ vendorName, onClose }: { vendorName: string; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <BadgeCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Inquiry Sent!</h3>
            <p className="text-muted-foreground text-sm">
              {vendorName} will respond to your inquiry within 24 hours.
            </p>
            <Button className="mt-6 rounded-xl w-full" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Send Inquiry</h3>
                <p className="text-xs text-muted-foreground">to {vendorName}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inq-name" className="text-xs">Name *</Label>
                  <Input id="inq-name" placeholder="Your name" className="rounded-xl h-10 text-sm"
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inq-phone" className="text-xs">Phone</Label>
                  <Input id="inq-phone" placeholder="+91 98765..." className="rounded-xl h-10 text-sm"
                    value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inq-email" className="text-xs">Email *</Label>
                <Input id="inq-email" type="email" placeholder="you@company.in" className="rounded-xl h-10 text-sm"
                  value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inq-message" className="text-xs">Message *</Label>
                <textarea
                  id="inq-message"
                  rows={4}
                  placeholder="Describe your requirements, quantities, and any specific questions..."
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 font-bold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : "Send Inquiry"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VendorStore() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetVendorBySlug(slug!);
  const [showInquiry, setShowInquiry] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  // Extract unique categories from products
  const productCategories = ["all", ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))];
  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p: any) => p.category === activeCategory);

  return (
    <PublicLayout>
      {/* Banner / Cover Image */}
      <div className="relative h-60 sm:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 overflow-hidden">
        {vendor.banner ? (
          <img src={vendor.banner} alt={vendor.businessName} className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }} />
            <div className="absolute top-8 left-12 w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
            <div className="absolute bottom-4 right-12 w-32 h-32 rounded-full blur-3xl opacity-15"
              style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />

        <div className="absolute top-4 left-4">
          <Link href="/vendors">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> All Vendors
            </Button>
          </Link>
        </div>
      </div>

      {/* Vendor Header */}
      <div className="bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 relative z-10">
            {/* Logo */}
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="w-24 h-24 rounded-2xl border-4 border-background object-cover shadow-2xl flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-background bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-2xl flex-shrink-0">
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
                {vendor.subscriptionPlan && vendor.subscriptionPlan !== "free" && (
                  <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/25 text-[10px] capitalize">
                    <Award className="w-2.5 h-2.5 mr-1" />{vendor.subscriptionPlan}
                  </Badge>
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
                    <span>({vendor.reviewCount || reviews.length} reviews)</span>
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

            <div className="sm:ml-auto flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowInquiry(true)}>
                <MessageSquare className="w-4 h-4" /> Send Inquiry
              </Button>
              <Button className="rounded-xl gap-2" asChild>
                <Link href="/products">
                  <ShoppingBag className="w-4 h-4" /> Browse Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Sidebar: About + Info */}
          <div className="lg:col-span-1 space-y-5">
            {/* About Business */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-bold text-foreground text-base mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> About the Business
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {vendor.description || `${vendor.businessName} is a verified wholesale supplier on Vendorkart, offering quality bulk products to B2B buyers across India.`}
              </p>
            </div>

            {/* Business Details */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-bold text-foreground text-base mb-1">Business Details</h2>
              {vendor.gstNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">GST Verified</p>
                    <p className="text-xs text-muted-foreground">{vendor.gstNumber}</p>
                  </div>
                </div>
              )}
              {(vendor.city || vendor.state) && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Location</p>
                    <p className="text-xs text-muted-foreground">{[vendor.city, vendor.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Total Products</p>
                  <p className="text-xs text-muted-foreground">{vendor.productCount || products.length} listings</p>
                </div>
              </div>
              {rating > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Rating</p>
                    <p className="text-xs text-muted-foreground">{rating.toFixed(1)} / 5.0 ({vendor.reviewCount || reviews.length} reviews)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact / Inquiry CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
              <h2 className="font-bold text-foreground text-base mb-2">Get a Quote</h2>
              <p className="text-muted-foreground text-xs mb-5 leading-relaxed">
                Interested in bulk orders? Send a direct inquiry to {vendor.businessName} for custom pricing.
              </p>
              <Button className="w-full rounded-xl gap-2" onClick={() => setShowInquiry(true)}>
                <MessageSquare className="w-4 h-4" /> Contact Vendor
              </Button>
            </div>

            {/* Product Categories */}
            {productCategories.length > 2 && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-foreground text-base mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" /> Product Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {productCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/60 text-foreground hover:bg-secondary"
                      }`}
                    >
                      {cat === "all" ? "All Products" : cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main: Products + Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold text-foreground">
                  {activeCategory === "all" ? `Products by ${vendor.businessName}` : activeCategory}
                </h2>
                <span className="text-sm text-muted-foreground">{filteredProducts.length} listed</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                  <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No products in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProducts.map((product: any) => (
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

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-5">
                Customer Reviews {reviews.length > 0 && <span className="text-muted-foreground font-normal text-sm">({reviews.length})</span>}
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                  <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                </div>
              ) : (
                <>
                  {/* Rating summary */}
                  {rating > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-5 mb-5 flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-5xl font-extrabold text-foreground">{rating.toFixed(1)}</p>
                        <div className="flex gap-0.5 justify-center my-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
                          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground w-3">{star}</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-muted-foreground w-4">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="bg-card rounded-2xl border border-border/50 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {r.customerName?.slice(0, 2)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{r.customerName ?? "Anonymous"}</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </div>
                          {r.createdAt && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal vendorName={vendor.businessName} onClose={() => setShowInquiry(false)} />
      )}
    </PublicLayout>
  );
}
