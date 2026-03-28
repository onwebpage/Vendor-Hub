import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListCategories } from "@workspace/api-client-react";
import { Tag, Package, Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Link } from "wouter";

const categoryColors = [
  "from-blue-500/15 to-blue-400/5 border-blue-500/20",
  "from-violet-500/15 to-violet-400/5 border-violet-500/20",
  "from-emerald-500/15 to-emerald-400/5 border-emerald-500/20",
  "from-amber-500/15 to-amber-400/5 border-amber-500/20",
  "from-rose-500/15 to-rose-400/5 border-rose-500/20",
  "from-indigo-500/15 to-indigo-400/5 border-indigo-500/20",
  "from-teal-500/15 to-teal-400/5 border-teal-500/20",
  "from-orange-500/15 to-orange-400/5 border-orange-500/20",
];

const iconColors = [
  "text-blue-500", "text-violet-500", "text-emerald-500", "text-amber-500",
  "text-rose-500", "text-indigo-500", "text-teal-500", "text-orange-500",
];

export default function VendorCategories() {
  const [search, setSearch] = React.useState("");
  const { data: categories = [], isLoading, isError } = useListCategories();

  const filtered = (categories as any[]).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display">Categories</h2>
          <p className="text-muted-foreground text-sm mt-1">Browse all product categories available on the marketplace</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="w-10 h-10 text-destructive/60" />
            <p>Failed to load categories.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((cat: any, i: number) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`relative bg-gradient-to-br ${categoryColors[i % categoryColors.length]} border rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 bg-white/20 dark:bg-black/10 rounded-xl ${iconColors[i % iconColors.length]}`}>
                      {cat.icon ? (
                        <span className="text-xl">{cat.icon}</span>
                      ) : (
                        <Tag className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-semibold bg-white/30 dark:bg-black/20 px-2 py-0.5 rounded-full text-foreground/70">
                      {cat.productCount ?? 0} products
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                  )}
                  <Link href={`/vendor-dashboard/add-product`}>
                    <p className="text-xs font-semibold mt-3 text-primary hover:underline">
                      Add product in this category →
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Tag className="w-10 h-10 text-muted-foreground/40" />
                <p>No categories match your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
