import React, { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, PackageX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Debounce search slightly for better UX (simplified here)
  const [activeSearch, setActiveSearch] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const { data, isLoading } = useListProducts({ 
    search: activeSearch || undefined,
    category: category !== 'all' ? category : undefined,
    sortBy,
    limit: 20
  });

  return (
    <PublicLayout>
      <div className="bg-muted/30 py-8 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-display font-bold mb-6">Wholesale Catalog</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, SKU, or keyword..." 
                  className="pl-10 h-12 rounded-xl bg-card border-border"
                />
              </div>
              <Button type="submit" className="h-12 rounded-xl px-8">Search</Button>
            </form>
            
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Apparel">Apparel</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl bg-card">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="moq_asc">MOQ: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />)}
          </div>
        ) : data?.products?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              We couldn't find any products matching your current search and filter criteria. Try adjusting them.
            </p>
            <Button variant="outline" onClick={() => { setSearch(""); setActiveSearch(""); setCategory("all"); }} className="rounded-xl">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
