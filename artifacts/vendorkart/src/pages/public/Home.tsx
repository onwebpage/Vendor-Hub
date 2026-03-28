import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Factory, TrendingUp, Users, Shield, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: productData, isLoading } = useListProducts({ limit: 8 });

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-background py-24 lg:py-32" style={{background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 70%, #1d4ed8 100%)"}}>
        <div className="absolute inset-0">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%), radial-gradient(circle at 60% 80%, #0ea5e9 0%, transparent 40%)"}} />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px"}} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-900/40" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold tracking-wider mb-6 border border-primary/30">
                INDIA'S PREMIER B2B MARKETPLACE
              </span>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold tracking-tight mb-8 leading-[1.1]">
                Wholesale Sourcing, <span className="text-primary">Simplified.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted/80 mb-10 max-w-2xl leading-relaxed">
                Connect directly with verified manufacturers, distributors, and bulk suppliers. Get the best rates for your business with secure payments and reliable logistics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all" asChild>
                  <Link href="/register?role=customer">
                    Start Buying <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white transition-all" asChild>
                  <Link href="/register?role=vendor">
                    Become a Vendor
                  </Link>
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm font-medium text-muted/60">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Verified Suppliers</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Secure Escrow Payments</div>
                <div className="flex items-center gap-2 hidden sm:flex"><CheckCircle2 className="w-5 h-5 text-primary" /> Dedicated Account Managers</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold">Top Categories</h2>
              <p className="text-muted-foreground mt-2">Source from our most popular wholesale categories.</p>
            </div>
            <Link href="/categories" className="hidden sm:flex items-center text-primary font-semibold hover:underline">
              View All Categories <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Electronics', 'Industrial', 'Apparel', 'Agriculture', 'Medical', 'Construction'].map((cat, i) => (
              <Link key={i} href={`/products?category=${cat}`} className="group block">
                <div className="bg-secondary/50 rounded-2xl p-6 text-center border border-border/50 hover:bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Factory className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-foreground">{cat}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold">Trending Wholesale Products</h2>
              <p className="text-muted-foreground mt-2">High-demand items available for immediate bulk order.</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center text-primary font-semibold hover:underline">
              Browse Catalog <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productData?.products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {/* Fallback if no data */}
              {!productData?.products?.length && (
                <div className="col-span-full text-center py-12 bg-card rounded-2xl border border-border">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold">No products found</h3>
                  <p className="text-muted-foreground">The catalog is currently empty.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 rotate-3">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Businesses Only</h3>
              <p className="text-muted-foreground">Every vendor and buyer undergoes strict verification to ensure a secure trading environment.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 -rotate-3">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Bulk Pricing</h3>
              <p className="text-muted-foreground">Clear volume discounts. See exact pricing tiers before you negotiate or place orders.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 rotate-3">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Communication</h3>
              <p className="text-muted-foreground">Connect directly with manufacturers. No hidden middlemen marking up prices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">Ready to scale your business?</h2>
          <p className="text-xl mb-10 text-primary-foreground/80">Join thousands of businesses trading securely on Vendorkart.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-xl font-bold text-primary" asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
