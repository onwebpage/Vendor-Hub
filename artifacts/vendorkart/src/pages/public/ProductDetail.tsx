import React, { useState } from "react";
import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetProduct, useAddToCart } from "@workspace/api-client-react";
import { Store, Star, ShieldCheck, Truck, Plus, Minus, ShoppingCart, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0");
  const { data, isLoading } = useGetProduct(id);
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  
  const [quantity, setQuantity] = useState<number>(0);
  
  // Set initial quantity to MOQ when data loads
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

  // Calculate dynamic price based on bulk tiers
  let currentPrice = product.price;
  let activeTierIndex = -1;
  
  if (product.bulkPricing && product.bulkPricing.length > 0) {
    // Sort tiers by minQty descending to find the highest applicable tier
    const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(t => quantity >= t.minQty);
    if (applicableTier) {
      currentPrice = applicableTier.price;
      activeTierIndex = product.bulkPricing.indexOf(applicableTier);
    }
  }

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

  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumb could go here */}
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left: Images */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="aspect-square bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000"} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl border border-border bg-white p-2 shrink-0 cursor-pointer hover:border-primary">
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
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
                  <span className="font-bold">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
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
                
                {/* Bulk Pricing Tiers */}
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
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm pt-4 border-t border-border/50">
                  <span className="text-muted-foreground">Total Item Price:</span>
                  <span className="font-bold text-lg">₹{(currentPrice * quantity).toLocaleString()}</span>
                </div>
              </div>

              {/* Vendor Info Box */}
              <div className="bg-secondary/30 rounded-2xl p-5 border border-border/50 mb-8 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full border border-border flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  {vendor?.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sold by</div>
                  <h3 className="font-bold text-lg leading-none mb-2">{vendor?.businessName}</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" /> Verified Supplier</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> {vendor?.rating?.toFixed(1) || 'New'}</span>
                  </div>
                </div>
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
    </PublicLayout>
  );
}
