import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, Menu, X, Heart, LogOut, LayoutDashboard,
  ChevronDown, Cpu, Shirt, Home as HomeIcon, Factory, Grid3X3,
  ArrowRight, SlidersHorizontal, Tag, Package, Zap, TrendingUp,
  ArrowUpRight, Command,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const categoryItems = [
  { name: "Electronics", href: "/products?category=Electronics", icon: Cpu, color: "text-blue-400" },
  { name: "Clothing", href: "/products?category=Apparel", icon: Shirt, color: "text-violet-400" },
  { name: "Home Decor", href: "/products?category=Home+Decor", icon: HomeIcon, color: "text-amber-400" },
  { name: "Industrial", href: "/products?category=Industrial", icon: Factory, color: "text-slate-400" },
  { name: "More...", href: "/categories", icon: Grid3X3, color: "text-emerald-400" },
];

const quickFilters = [
  { label: "Bulk Orders", icon: Package, href: "/products?bulk=true", color: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
  { label: "Low MOQ", icon: Zap, href: "/products?moq=low", color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" },
  { label: "Best Price", icon: Tag, href: "/products?sort=price_asc", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
  { label: "Trending", icon: TrendingUp, href: "/products?sort=newest", color: "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20" },
];

const popularSearches = [
  "Industrial sensors bulk", "Cotton fabric MOQ 500", "LED lights wholesale",
  "Pharma packaging", "Auto spare parts", "Electronics components",
];

const quickLinks = [
  { label: "All Products", href: "/products", icon: Package },
  { label: "All Vendors", href: "/vendors", icon: ShoppingBag },
  { label: "Top Categories", href: "/categories", icon: Grid3X3 },
];

/* ─────────────────────────────────────────────────────────
   SEARCH MODAL
───────────────────────────────────────────────────────── */
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    setLocation(`/products?search=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center pt-[10vh] px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl bg-card/95 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
            placeholder="Search products, vendors, categories, MOQ..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base font-medium outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-mono border border-border ml-1">
            ESC
          </kbd>
        </div>

        <div className="p-5 space-y-6">
          {/* Quick Filters */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3" /> Quick Filters
            </p>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((f) => (
                <Link
                  key={f.label}
                  href={f.href}
                  onClick={onClose}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${f.color}`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Searches */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Popular Searches
            </p>
            <div className="grid grid-cols-2 gap-1">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/60 transition-colors text-left group"
                >
                  <Search className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{term}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground ml-auto transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> Jump To
            </p>
            <div className="flex gap-2">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary/70 transition-colors text-sm font-medium text-foreground"
                >
                  <l.icon className="w-4 h-4 text-muted-foreground" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-border flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">↵</kbd> to search</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">ESC</kbd> to close</span>
          <span className="ml-auto flex items-center gap-1">Powered by <span className="font-bold text-primary">Vendorkart</span></span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────────────────── */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  // ⌘K / Ctrl+K shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => { logout(); setLocation("/"); };
  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : user.role === "vendor" ? "/vendor-dashboard" : "/customer-dashboard";
  };
  const closeAll = () => { setIsMobileMenuOpen(false); setIsMobileCategoryOpen(false); };

  /* shared nav-link class */
  const nl = (href: string) =>
    `px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === href ? "text-foreground bg-secondary/60" : ""}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-xs font-medium tracking-wide">
        B2B Wholesale Marketplace: Get 10% off your first bulk order with code{" "}
        <span className="font-bold">WELCOME10</span>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Vendor<span className="text-primary">kart</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-muted-foreground flex-1 justify-center">

              {/* 1. Home */}
              <Link href="/" className={nl("/")}>Home</Link>

              {/* 2. Categories dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <button className="flex items-center gap-1 px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap">
                  Categories
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {categoryItems.map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/60 transition-colors group"
                            onClick={() => setIsCategoryOpen(false)}
                          >
                            <cat.icon className={`w-4 h-4 ${cat.color}`} />
                            <span className="text-sm font-medium text-foreground">{cat.name}</span>
                            {cat.name === "More..." && (
                              <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. All Vendors */}
              <Link href="/vendors" className={nl("/vendors")}>All Vendors</Link>

              {/* 4. Product Listing */}
              <Link href="/products" className={nl("/products")}>Product Listing</Link>

              {/* 5. Product Details */}
              <Link href="/products" className="px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap">
                Product Details
              </Link>

              {/* 6. Search + Filters — PREMIUM PILL */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  Search + Filters
                </span>
                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/80 border border-border text-[10px] text-muted-foreground font-mono ml-1 group-hover:border-primary/30 transition-colors">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              </button>

              {/* 7. About Us */}
              <Link href="/about" className={nl("/about")}>About Us</Link>

              {/* 8. Contact Us */}
              <Link href="/contact" className={nl("/contact")}>Contact Us</Link>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {user?.role === "customer" && (
                    <>
                      <Link href="/customer-dashboard/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary/60">
                        <Heart className="h-5 w-5" />
                      </Link>
                      <Link href="/customer-dashboard/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary/60">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center rounded-full">3</span>
                      </Link>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 inline-block px-2 py-1 rounded w-max">
                            {user?.role} Account
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLocation(getDashboardLink())} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="font-semibold" onClick={() => setLocation("/login")}>Log in</Button>
                  <Button size="sm" className="rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all" onClick={() => setLocation("/register")}>Sign up</Button>
                </div>
              )}
            </div>

            {/* Mobile: search pill + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              {isAuthenticated && user?.role === "customer" && (
                <Link href="/customer-dashboard/cart" className="relative p-2 text-foreground">
                  <ShoppingBag className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground rounded-lg hover:bg-secondary/60 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-0 top-[88px] bg-background border-b border-border shadow-2xl z-40 overflow-y-auto max-h-[85vh]"
          >
            <div className="p-4 space-y-1">
              <Link href="/" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Home</Link>

              {/* Categories */}
              <button onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)} className="flex items-center justify-between w-full p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors">
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isMobileCategoryOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4 space-y-1">
                    {categoryItems.map((cat) => (
                      <Link key={cat.name} href={cat.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors" onClick={closeAll}>
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link href="/vendors" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/vendors" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>All Vendors</Link>
              <Link href="/products" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/products" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Product Listing</Link>
              <Link href="/products" className="flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors" onClick={closeAll}>Product Details</Link>

              {/* Search + Filters premium pill in mobile menu */}
              <button
                onClick={() => { closeAll(); setIsSearchOpen(true); }}
                className="flex items-center gap-3 w-full p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors text-left"
              >
                <Search className="w-5 h-5 text-primary" />
                <span>Search + Filters</span>
                <kbd className="ml-auto text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
              </button>

              <Link href="/about" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/about" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>About Us</Link>
              <Link href="/contact" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/contact" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Contact Us</Link>

              <div className="h-px bg-border w-full !my-4" />

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="p-3 text-sm text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{user?.name}</span></div>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-11" onClick={() => { setLocation(getDashboardLink()); closeAll(); }}>
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                  </Button>
                  <Button variant="destructive" className="w-full justify-start rounded-xl h-11" onClick={() => { handleLogout(); closeAll(); }}>
                    <LogOut className="mr-2 h-5 w-5" /> Log out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="rounded-xl h-11" onClick={() => { setLocation("/login"); closeAll(); }}>Log in</Button>
                  <Button className="rounded-xl h-11" onClick={() => { setLocation("/register"); closeAll(); }}>Sign up</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow w-full">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-background/80 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="h-7 w-7 text-primary" />
                <span className="font-display font-bold text-xl tracking-tight">Vendor<span className="text-primary">kart</span></span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-muted-foreground">
                The premier B2B multi-vendor marketplace connecting businesses with verified wholesale suppliers across India.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-wider text-xs">Marketplace</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/vendors" className="hover:text-primary transition-colors">Verified Vendors</Link></li>
                <li><Link href="/categories" className="hover:text-primary transition-colors">Categories A-Z</Link></li>
                <li><Link href="/products" className="hover:text-primary transition-colors">Search + Filters</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-wider text-xs">For Business</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/register?role=vendor" className="hover:text-primary transition-colors">Sell on Vendorkart</Link></li>
                <li><Link href="/register?role=customer" className="hover:text-primary transition-colors">Buy Wholesale</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-wider text-xs">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Login / Register</Link></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Vendorkart. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
              <span className="cursor-pointer hover:text-white transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
