import { Link } from "wouter";
import { Package, TrendingUp, Star, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop";

  return (
    <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative">
      {product.isFeatured && (
        <Badge className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground border-none shadow-lg">
          <TrendingUp className="w-3 h-3 mr-1" /> Featured
        </Badge>
      )}
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary/30">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          {product.categoryName || 'Category'}
        </div>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display font-bold text-lg text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {product.shortDescription || "High-quality wholesale product available for bulk order."}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Starting from</div>
            <div className="font-bold text-xl text-foreground">
              ₹{product.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">/{product.unit || 'unit'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">MOQ</div>
            <div className="font-bold text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
              {product.moq || 1} {product.unit || 'units'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
          <Link href={`/vendor/${product.vendorSlug || product.vendorId}`} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
            <Store className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{product.vendorName || `Vendor #${product.vendorId}`}</span>
          </Link>
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold ml-1">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
