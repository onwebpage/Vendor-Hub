import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Search, SlidersHorizontal, PackageX, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Industrial",
  "Apparel",
  "Home Decor",
  "Agriculture",
  "Medical & Pharma",
  "Automotive",
  "Food & Beverages",
];

function FilterPanel({
  category, setCategory,
  sortBy, setSortBy,
  priceRange, setPriceRange,
  moqMax, setMoqMax,
  bulkOnly, setBulkOnly,
  onClear,
}: {
  category: string;
  setCategory: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  moqMax: number;
  setMoqMax: (v: number) => void;
  bulkOnly: boolean;
  setBulkOnly: (v: boolean) => void;
  onClear: () => void;
}) {
  const [priceOpen, setPriceOpen] = useState(true);
  const [moqOpen, setMoqOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full rounded-xl bg-card h-10">
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

      {/* Category */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All Categories" ? "all" : cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (cat === "All Categories" ? "all" : cat) === category
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-secondary/60 text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <button
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
          onClick={() => setPriceOpen(!priceOpen)}
        >
          Price Range (₹) {priceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {priceOpen && (
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
              min={0}
              max={100000}
              step={500}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* MOQ Filter */}
      <div>
        <button
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
          onClick={() => setMoqOpen(!moqOpen)}
        >
          Max MOQ (units) {moqOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {moqOpen && (
          <div className="space-y-3">
            <Slider
              value={[moqMax]}
              onValueChange={(v) => setMoqMax(v[0])}
              min={1}
              max={10000}
              step={50}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>1 unit</span>
              <span className="font-semibold text-foreground">{moqMax.toLocaleString()} units</span>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Only */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setBulkOnly(!bulkOnly)}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${bulkOnly ? "bg-primary" : "bg-border"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${bulkOnly ? "translate-x-5" : ""}`} />
        </button>
        <span className="text-sm font-medium">Bulk orders only</span>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full rounded-xl" onClick={onClear}>
        <X className="w-4 h-4 mr-2" /> Clear All Filters
      </Button>
    </div>
  );
}

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [moqMax, setMoqMax] = useState<number>(10000);
  const [bulkOnly, setBulkOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [
    category !== "all",
    sortBy !== "newest",
    priceRange[0] > 0 || priceRange[1] < 100000,
    moqMax < 10000,
    bulkOnly,
  ].filter(Boolean).length;

  const { data, isLoading } = useListProducts({
    search: activeSearch || undefined,
    category: category !== "all" ? category : undefined,
    sortBy,
    limit: 24,
  });

  const clearFilters = () => {
    setSearch("");
    setActiveSearch("");
    setCategory("all");
    setSortBy("newest");
    setPriceRange([0, 100000]);
    setMoqMax(10000);
    setBulkOnly(false);
  };

  // Client-side filtering for price and MOQ (server doesn't support these yet)
  const filteredProducts = (data?.products ?? []).filter((p) => {
    const price = parseFloat(String(p.price));
    const moq = Number(p.moq ?? 1);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (moq > moqMax) return false;
    if (bulkOnly && moq < 10) return false;
    return true;
  });

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-muted/30 py-8 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-display font-bold mb-2">Wholesale Catalog</h1>
          <p className="text-muted-foreground text-sm mb-6">Browse bulk products from verified manufacturers and distributors</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <form
              onSubmit={(e) => { e.preventDefault(); setActiveSearch(search); }}
              className="flex-1 flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, SKU, or keyword..."
                  className="pl-10 h-11 rounded-xl bg-card border-border"
                />
              </div>
              <Button type="submit" className="h-11 rounded-xl px-6">Search</Button>
            </form>

            <Button
              variant="outline"
              className="h-11 rounded-xl gap-2 relative"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-sm">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount} active</Badge>
                )}
              </div>
              <FilterPanel
                category={category} setCategory={setCategory}
                sortBy={sortBy} setSortBy={setSortBy}
                priceRange={priceRange} setPriceRange={setPriceRange}
                moqMax={moqMax} setMoqMax={setMoqMax}
                bulkOnly={bulkOnly} setBulkOnly={setBulkOnly}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
              <div className="relative ml-auto w-80 max-w-full h-full bg-card border-l border-border overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <FilterPanel
                  category={category} setCategory={setCategory}
                  sortBy={sortBy} setSortBy={setSortBy}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  moqMax={moqMax} setMoqMax={setMoqMax}
                  bulkOnly={bulkOnly} setBulkOnly={setBulkOnly}
                  onClear={() => { clearFilters(); setIsFilterOpen(false); }}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {category !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {category}
                    <button onClick={() => setCategory("all")}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                    <button onClick={() => setPriceRange([0, 100000])}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {moqMax < 10000 && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    MOQ ≤ {moqMax}
                    <button onClick={() => setMoqMax(10000)}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {bulkOnly && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Bulk Only
                    <button onClick={() => setBulkOnly(false)}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
              </div>
            )}

            {/* Result count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-3xl border border-border">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <PackageX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No products found</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  No products match your current filters. Try adjusting the price range, MOQ, or category.
                </p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
