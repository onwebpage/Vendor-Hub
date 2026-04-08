import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetProduct, useAddToCart, useGetWishlist, useAddToWishlist, useRemoveFromWishlist } from "@workspace/api-client-react";
import { Store, Star, ShieldCheck, Plus, Minus, ShoppingCart, Loader2, Package, TrendingUp, Heart, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

function View360({ images }: { images: [string, string] }) {
  const [idx, setIdx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const startX = useRef<number | null>(null);
  const accumulated = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const THRESHOLD = 60;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!dragging) setIdx(i => (i + 1) % 2);
    }, 2500);
    return () => clearInterval(timer);
  }, [dragging]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const onMove = useCallback((clientX: number) => {
    if (startX.current === null) return;
    accumulated.current += clientX - startX.current;
    startX.current = clientX;
    if (Math.abs(accumulated.current) >= THRESHOLD) {
      setIdx(i => (i + 1) % 2);
      accumulated.current = 0;
      setShowHint(false);
    }
  }, []);

  const onStart = (clientX: number) => { setDragging(true); startX.current = clientX; accumulated.current = 0; };
  const onEnd = () => { setDragging(false); startX.current = null; accumulated.current = 0; };

  return (
    <div ref={containerRef} className="relative aspect-square bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex items-center justify-center p-4 select-none cursor-grab active:cursor-grabbing"
      onMouseDown={e => onStart(e.clientX)}
      onMouseMove={e => dragging && onMove(e.clientX)}
      onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)}
      onTouchMove={e => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}>
      <img
        src={images[idx]}
        alt={`360 view ${idx + 1}`}
        className="max-w-full max-h-full object-contain transition-opacity duration-200 pointer-events-none"
        draggable={false}
      />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm">
        <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
        360°
      </div>
      {showHint && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center">
          <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            ← Drag to rotate →
          </div>
        </div>
      )}
      <div className="absolute bottom-3 right-3 flex gap-1">
        {[0, 1].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0");
  const { data, isLoading } = useGetProduct(id);
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();
  const { mutate: addToWishlist, isPending: addingToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: removingFromWishlist } = useRemoveFromWishlist();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { data: wishlistItems } = useGetWishlist({ query: { enabled: isAuthenticated && user?.role === "customer" } });
  
  const [quantity, setQuantity] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<number>(0);
  
  React.useEffect(() => {
    if (data?.product && quantity === 0) {
      setQuantity(data.product.moq || 1);
    }
  }, [data, quantity]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
          <Skeleton className="w-full md:w-1/2 aspect-square rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!data?.product) {
    return (
      <PublicLayout>
         <div className="py-24 text-center">Product not found.</div>
      </PublicLayout>
    );
  }

  const { product, vendor } = data;
  const moq = product.moq || 1;

  let currentPrice = product.price;
  let activeTierIndex = -1;
  
  if (product.bulkPricing && product.bulkPricing.length > 0) {
    const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(t => quantity >= t.minQty);
    if (applicableTier) {
      currentPrice = applicableTier.price;
      activeTierIndex = product.bulkPricing.indexOf(applicableTier);
    }
  }

  const isWishlisted = wishlistItems?.some((item: any) => item.productId === id) ?? false;

  const handleWishlistToggle = () => {
    if (!isAuthenticated || user?.role !== "customer") {
      toast({ title: "Please log in", description: "You need a buyer account to save products.", variant: "destructive" });
      return;
    }
    if (isWishlisted) {
      removeFromWishlist({ productId: id }, {
        onSuccess: () => toast({ title: "Removed from wishlist" }),
        onError: () => toast({ title: "Failed to update wishlist", variant: "destructive" }),
      });
    } else {
      addToWishlist({ data: { productId: id } }, {
        onSuccess: () => toast({ title: "Saved to wishlist", description: product.name }),
        onError: () => toast({ title: "Failed to save", variant: "destructive" }),
      });
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      toast({ title: "Please login", description: "You need a buyer account to add to cart.", variant: "destructive" });
      return;
    }
    
    addToCart(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart", description: `${quantity} ${product.unit || 'units'} added.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add to cart", variant: "destructive" });
        }
      }
    );
  };

  const images = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000"];
  const images360 = (product as any).images360 as string[] | undefined;
  const has360View = Array.isArray(images360) && images360.length >= 2 && images360[0] && images360[1];
  const vendorPhone = (vendor as any)?.phone;
  const vendorWaHref = vendorPhone ? `https://wa.me/${vendorPhone.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%27m%20interested%20in%20your%20product%3A%20${encodeURIComponent(product.name)}` : null;

  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left: Images */}
            <div className="w-full lg:w-1/2 space-y-4">
              {has360View ? (
                <>
                  <View360 images={[images360![0], images360![1]]} />
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <div key={idx} onClick={() => setActiveImage(idx)}
                          className={`w-20 h-20 rounded-xl border-2 bg-white p-1.5 shrink-0 cursor-pointer transition-all ${activeImage === idx ? "border-primary shadow-md shadow-primary/20" : "border-border hover:border-primary/50"}`}>
                          <img src={img} alt="" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="aspect-square bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex items-center justify-center p-4">
                    <img 
                      src={images[activeImage]} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <div key={idx} onClick={() => setActiveImage(idx)}
                          className={`w-20 h-20 rounded-xl border-2 bg-white p-1.5 shrink-0 cursor-pointer transition-all ${activeImage === idx ? "border-primary shadow-md shadow-primary/20" : "border-border hover:border-primary/50"}`}>
                          <img src={img} alt="" className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <Badge variant="outline" className="w-fit mb-4 text-primary border-primary/30 bg-primary/5 uppercase tracking-wider">
                {product.categoryName}
              </Badge>
              
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-border/50">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold">{product.rating ? parseFloat(String(product.rating)).toFixed(1) : 'New'}</span>
                  <span className="text-muted-foreground text-sm ml-1">({product.reviewCount || 0} reviews)</span>
                </div>
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <Package className="w-4 h-4" /> SKU: {product.sku || 'N/A'}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mb-8">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-display font-bold text-foreground">₹{currentPrice.toLocaleString()}</span>
                  <span className="text-lg text-muted-foreground pb-1">/ {product.unit || 'unit'}</span>
                  {product.comparePrice && product.comparePrice > currentPrice && (
                    <span className="text-lg text-muted-foreground line-through pb-1 ml-2">₹{product.comparePrice.toLocaleString()}</span>
                  )}
                </div>
                
                {product.bulkPricing && product.bulkPricing.length > 0 && (
                  <div className="mt-6 bg-secondary/50 rounded-2xl p-4 border border-border">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Volume Discounts
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {product.bulkPricing.map((tier, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-xl border text-center transition-colors cursor-pointer
                            ${activeTierIndex === idx ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/50'}`}
                          onClick={() => setQuantity(tier.minQty)}
                        >
                          <div className="text-xs opacity-80 mb-1">{tier.minQty}+ {product.unit || 'units'}</div>
                          <div className="font-bold">₹{tier.price.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart Widget */}
              <div className="bg-card border border-border shadow-lg shadow-black/5 rounded-3xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Quantity</span>
                  <span className="text-sm text-muted-foreground">Min. Order: {moq} {product.unit || 'units'}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-border rounded-xl bg-background h-14 w-full sm:w-auto">
                    <button 
                      className="px-4 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(q => Math.max(moq, q - 1))}
                      disabled={quantity <= moq}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(moq, parseInt(e.target.value) || moq))}
                      className="w-16 text-center font-bold bg-transparent border-none focus:ring-0 text-lg"
                    />
                    <button 
                      className="px-4 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <Button 
                    className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 w-14 rounded-xl shrink-0 border-border"
                    onClick={handleWishlistToggle}
                    disabled={addingToWishlist || removingFromWishlist}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                  </Button>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm pt-4 border-t border-border/50">
                  <span className="text-muted-foreground">Total Item Price:</span>
                  <span className="font-bold text-lg">₹{(currentPrice * quantity).toLocaleString()}</span>
                </div>
              </div>

              {/* Vendor Info Box */}
              <div className="bg-secondary/30 rounded-2xl border border-border/50 mb-8 overflow-hidden">
                <Link href={product.vendorSlug ? `/vendors/${product.vendorSlug}` : "#"}>
                  <div className="flex items-start gap-4 p-5 hover:bg-secondary/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-full border border-border flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {vendor?.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Sold by</div>
                      <h3 className="font-bold text-lg leading-none mb-2 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {vendor?.businessName}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" /> Verified Supplier</span>
                        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> {vendor?.rating ? parseFloat(String(vendor.rating)).toFixed(1) : 'New'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                {vendorWaHref && (
                  <div className="px-5 pb-4">
                    <a
                      href={vendorWaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5c] transition-colors"
                    >
                      <WaIcon />
                      WhatsApp Vendor
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold mb-4">Product Details</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{product.description || product.shortDescription || "No detailed description provided."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor WhatsApp Floating Button */}
      {vendorWaHref && (
        <a
          href={vendorWaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-28 left-6 z-[9998] flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white text-sm font-semibold shadow-xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all"
          aria-label="WhatsApp Vendor"
        >
          <WaIcon />
          <span className="hidden sm:inline">Chat with Vendor</span>
        </a>
      )}
    </PublicLayout>
  );
}
