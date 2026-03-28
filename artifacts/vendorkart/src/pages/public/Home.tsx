import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Factory, TrendingUp, Users, Shield, Package, Star, Quote, Building2, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const testimonials = [
  { name: "Rajesh Mehta", role: "CEO, MegaSupply Pvt Ltd", company: "MegaSupply", avatar: "RM", rating: 5, text: "Vendorkart transformed how we source industrial components. We cut procurement costs by 32% in just 3 months. The vendor verification process gives us complete confidence.", color: "from-blue-600 to-indigo-600" },
  { name: "Priya Sharma", role: "Procurement Head, FashionHub", company: "FashionHub", avatar: "PS", rating: 5, text: "We scaled our clothing import from 3 vendors to 28 verified suppliers — all on Vendorkart. The bulk pricing tool alone saved us ₹14L last quarter.", color: "from-violet-600 to-purple-600" },
  { name: "Anil Gupta", role: "Founder, AgriTech Solutions", company: "AgriTech", avatar: "AG", rating: 5, text: "The MOQ feature is a game-changer for us. We can now negotiate directly with manufacturers and compare bulk quotes side-by-side. Incredible platform.", color: "from-emerald-600 to-teal-600" },
  { name: "Sunita Patel", role: "Director, MedEquip Traders", company: "MedEquip", avatar: "SP", rating: 5, text: "For medical equipment sourcing, trust is everything. Every vendor on Vendorkart is GST-verified and background-checked. It's become our #1 sourcing channel.", color: "from-rose-600 to-pink-600" },
  { name: "Deepak Verma", role: "MD, TechParts Industries", company: "TechParts", avatar: "DV", rating: 5, text: "We onboarded as a vendor 6 months ago and crossed ₹50L in sales. The platform's reach is unmatched — orders came from 12 different states!", color: "from-amber-600 to-orange-600" },
  { name: "Kavitha Nair", role: "Supply Chain Manager, HomeDecor Co", company: "HomeDecor Co", avatar: "KN", rating: 5, text: "The dashboard analytics help us track every order and payment in real-time. Customer support resolved our dispute within 24 hours. Highly recommend!", color: "from-cyan-600 to-sky-600" },
  { name: "Mohammed Iqbal", role: "Owner, ElectroBulk", company: "ElectroBulk", avatar: "MI", rating: 5, text: "I was skeptical at first, but Vendorkart's escrow payment system made me feel secure placing large orders. Now we do ₹20L+ monthly through the platform.", color: "from-indigo-600 to-blue-600" },
  { name: "Lakshmi Iyer", role: "Buyer, AutoParts Direct", company: "AutoParts Direct", avatar: "LI", rating: 5, text: "Finding authentic auto parts suppliers used to take weeks. Now we get 10+ verified quotes in hours. The subscription for vendors is totally worth it.", color: "from-teal-600 to-green-600" },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm truncate">{t.name}</p>
          <p className="text-white/50 text-xs truncate">{t.role}</p>
        </div>
        <Quote className="w-5 h-5 text-primary/60 ml-auto flex-shrink-0" />
      </div>
      <div className="flex mb-2">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-white/75 text-sm leading-relaxed line-clamp-3">{t.text}</p>
    </div>
  );
}

function TestimonialTicker() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <div className="relative h-full overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)" }}>
      <motion.div
        className="flex flex-col gap-4"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </motion.div>
    </div>
  );
}

const statsData = [
  { value: "12,000+", label: "Verified Vendors" },
  { value: "2.4L+", label: "B2B Buyers" },
  { value: "₹850Cr+", label: "Trade Volume" },
  { value: "98.4%", label: "Satisfaction Rate" },
];

const categories = [
  { name: "Electronics", icon: "💻", count: "2,400+" },
  { name: "Industrial", icon: "🔧", count: "1,800+" },
  { name: "Clothing", icon: "👗", count: "3,200+" },
  { name: "Agriculture", icon: "🌾", count: "900+" },
  { name: "Medical", icon: "🏥", count: "600+" },
  { name: "Home Decor", icon: "🏠", count: "1,500+" },
  { name: "Automotive", icon: "🚗", count: "1,100+" },
  { name: "Food & Bev", icon: "🍎", count: "750+" },
];

export default function Home() {
  const { data: productData, isLoading } = useListProducts({ limit: 8 });

  return (
    <PublicLayout>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden text-white min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Vendorkart B2B Marketplace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-blue-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Hero Copy */}
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/20 text-blue-300 text-xs font-bold tracking-widest mb-6 border border-primary/30 uppercase">
                  <Zap className="w-3 h-3" /> India's #1 B2B Wholesale Marketplace
                </span>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08]">
                  Wholesale<br />Sourcing,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Simplified.
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-white/65 mb-10 max-w-xl leading-relaxed">
                  Connect directly with verified manufacturers, distributors, and bulk suppliers. Get the best rates, with secure payments and reliable logistics — all in one platform.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all" asChild>
                    <Link href="/register?role=customer">
                      Start Buying Free <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all" asChild>
                    <Link href="/register?role=vendor">
                      Sell on Vendorkart
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/50">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> GST-Verified Suppliers</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Escrow Payments</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Commission Buying</div>
                </div>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 pt-10 border-t border-white/10"
              >
                {statsData.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-white/45 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Live Testimonial Ticker */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex flex-col h-[520px]"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-white/50 text-xs font-semibold tracking-wider uppercase">Live Customer Reviews</span>
              </div>
              <div className="flex-1 min-h-0">
                <TestimonialTicker />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST LOGOS STRIP ── */}
      <div className="bg-slate-950 border-y border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-white/25 text-xs font-semibold tracking-widest uppercase mr-6">Trusted by leading businesses</span>
            {["TechCorp India", "MegaSupply", "AgriFirst", "AutoParts Direct", "MedEquip Co", "HomeDecor Hub", "FashionBulk", "IndustrialPro"].map((b) => (
              <span key={b} className="text-white/35 text-sm font-bold px-4 py-1.5 border border-white/8 rounded-lg">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Browse by Industry</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Top Wholesale Categories</h2>
              <p className="text-muted-foreground mt-2">Source from our most popular B2B product categories.</p>
            </div>
            <Link href="/categories" className="hidden sm:flex items-center text-primary font-semibold hover:underline text-sm">
              All Categories <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link href={`/products?category=${cat.name}`} className="group block">
                  <div className="bg-card rounded-2xl p-4 text-center border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h3 className="font-bold text-foreground text-sm">{cat.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{cat.count} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Trending Now</p>
              <h2 className="text-3xl lg:text-4xl font-bold">Trending Wholesale Products</h2>
              <p className="text-muted-foreground mt-2">High-demand items available for immediate bulk order.</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center text-primary font-semibold hover:underline text-sm">
              Browse All <ArrowRight className="ml-1 w-4 h-4" />
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
              {!productData?.products?.length && (
                <div className="col-span-full text-center py-16 bg-card rounded-2xl border border-border">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold">Catalog Coming Soon</h3>
                  <p className="text-muted-foreground mt-1">Vendors are currently adding products. Check back shortly.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY VENDORKART ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Why Choose Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold">Built for B2B. Designed for Scale.</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Everything your business needs to source, negotiate, and transact with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Businesses Only", desc: "Every vendor and buyer undergoes strict GST and business verification. Zero tolerance for fraud.", color: "from-blue-500 to-indigo-600" },
              { icon: TrendingUp, title: "Transparent Bulk Pricing", desc: "Clear volume discount tiers. Compare quotes side-by-side before negotiating or placing orders.", color: "from-emerald-500 to-teal-600" },
              { icon: Globe, title: "Pan-India Network", desc: "Source from verified suppliers across all 28 states. Doorstep delivery, anywhere in India.", color: "from-violet-500 to-purple-600" },
              { icon: Zap, title: "Instant Quote Matching", desc: "Our smart engine matches your bulk requirements to the most competitive suppliers in seconds.", color: "from-amber-500 to-orange-600" },
              { icon: Building2, title: "Dedicated Account Manager", desc: "Premium and standard plan vendors get a dedicated relationship manager to grow their business.", color: "from-rose-500 to-pink-600" },
              { icon: Users, title: "Direct Communication", desc: "Chat directly with manufacturers. No hidden middlemen marking up prices or blocking access.", color: "from-cyan-500 to-sky-600" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-7 hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (full section) ── */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-2">Customer Stories</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Loved by 2 Lakh+ Businesses</h2>
            <p className="text-white/50 mt-3 max-w-lg mx-auto">Real businesses. Real savings. Real growth — powered by Vendorkart.</p>
          </div>

          {/* Three columns of scrolling testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[440px] overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
            {[0, 1, 2].map((col) => {
              const colItems = testimonials.filter((_, i) => i % 3 === col);
              const doubled = [...colItems, ...colItems];
              const dir = col === 1 ? "-50%" : "0%";
              const start = col === 1 ? "0%" : "0%";
              return (
                <motion.div
                  key={col}
                  className="flex flex-col gap-4"
                  animate={{ y: col === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
                  transition={{ duration: col === 1 ? 22 : 28, repeat: Infinity, ease: "linear" }}
                >
                  {doubled.map((t, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{t.name}</p>
                          <p className="text-white/40 text-xs">{t.role}</p>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-white/65 text-sm leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8" asChild>
              <Link href="/vendors">Explore Our Vendors <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6">Ready to scale your business?</h2>
          <p className="text-xl text-primary-foreground/75 mb-10">Join 2 lakh+ businesses trading securely on Vendorkart. Free to join, always.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-xl font-bold bg-white text-primary hover:bg-white/90 shadow-2xl" asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl font-bold border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/vendors">Browse Vendors</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
