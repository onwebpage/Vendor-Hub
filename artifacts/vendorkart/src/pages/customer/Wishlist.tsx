import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetWishlist, useRemoveFromWishlist, useAddToCart } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CustomerWishlist() {
  const { data: items, isLoading, refetch } = useGetWishlist();
  const { mutate: removeItem } = useRemoveFromWishlist();
  const { mutate: addToCart } = useAddToCart();
  const { toast } = useToast();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const handleRemove = (productId: number) => {
    removeItem({ productId }, {
      onSuccess: () => { toast({ title: "Removed from wishlist" }); refetch(); },
    });
  };

  const handleAddToCart = (productId: number) => {
    addToCart({ data: { productId, quantity: 1 } }, {
      onSuccess: () => toast({ title: "Added to cart!", description: "Item moved to your cart." }),
      onError: () => toast({ title: "Failed to add to cart", variant: "destructive" }),
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Wishlist</h1>
          <p className="text-muted-foreground mt-1">Saved products you want to procure later.</p>
        </div>
        {items && items.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border/50 rounded-xl px-4 py-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="font-semibold">{items.length} saved item{items.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">Save products you're interested in sourcing.</p>
          <Button asChild className="rounded-xl gap-2">
            <Link href="/products">Browse Products <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {item.productImages?.[0] ? (
                  <img
                    src={item.productImages[0]}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-white hover:border-destructive transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-bold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 mb-1">{item.productName}</h3>
                </Link>
                {item.vendorName && <p className="text-xs text-muted-foreground mb-3">{item.vendorName}</p>}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-lg">{fmt(item.price)}</span>
                  <Button
                    size="sm"
                    className="rounded-xl h-8 text-xs gap-1.5"
                    onClick={() => handleAddToCart(item.productId)}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
