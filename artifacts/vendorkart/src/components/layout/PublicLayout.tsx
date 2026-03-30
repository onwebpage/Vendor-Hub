import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, Menu, X, User as UserIcon,
  Package, Store, Heart, LogOut, LayoutDashboard,
  ChevronDown, Cpu, Shirt, Home as HomeIcon, Factory, Grid3X3,
  Phone, Info, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryItems = [
  { name: "Electronics", href: "/products?category=Electronics", icon: Cpu, color: "text-blue-400" },
  { name: "Clothing", href: "/products?category=Apparel", icon: Shirt, color: "text-violet-400" },
  { name: "Home Decor", href: "/products?category=Home+Decor", icon: HomeIcon, color: "text-amber-400" },
  { name: "Industrial", href: "/products?category=Industrial", icon: Factory, color: "text-slate-400" },
  { name: "More...", href: "/categories", icon: Grid3X3, color: "text-emerald-400" },
];

// Order: Home · Categories(dropdown) · All Vendors · Product Listing · Product Details · Search+Filters · About Us · Contact Us · Login/Register
const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Vendors", href: "/vendors" },
  { label: "Product Listing", href: "/products" },
  { label: "Product Details", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = React.useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin": return "/admin";
      case "vendor": return "/vendor-dashboard";
      default: return "/customer-dashboard";
    }
  };

  const closeAll = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCategoryOpen(false);
  };

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
          <div className="flex justify-between items-center h-18 py-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Vendor<span className="text-primary">kart</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search products, vendors, categories..."
                  className="w-full pl-10 pr-4 h-10 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 text-sm transition-all duration-300"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) setLocation(`/products?search=${encodeURIComponent(val.trim())}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Desktop Nav — exact order: Home · Categories · All Vendors · Product Listing · Product Details · Search+Filters · About Us · Contact Us */}
            <div className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-muted-foreground">

              {/* 1. Home */}
              <Link href="/" className={`px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === "/" ? "text-foreground bg-secondary/60" : ""}`}>
                Home
              </Link>

              {/* 2. Categories dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <button className="flex items-center gap-1 px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap">
                  Categories <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
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
              <Link href="/vendors" className={`px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === "/vendors" ? "text-foreground bg-secondary/60" : ""}`}>
                All Vendors
              </Link>

              {/* 4. Product Listing */}
              <Link href="/products" className={`px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === "/products" ? "text-foreground bg-secondary/60" : ""}`}>
                Product Listing
              </Link>

              {/* 5. Product Details (links to a product from the listing) */}
              <Link href="/products" className="px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap">
                Product Details
              </Link>

              {/* 6. Search + Filters */}
              <Link href="/products" className="px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap">
                Search + Filters
              </Link>

              {/* 7. About Us */}
              <Link href="/about" className={`px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === "/about" ? "text-foreground bg-secondary/60" : ""}`}>
                About Us
              </Link>

              {/* 8. Contact Us */}
              <Link href="/contact" className={`px-2.5 py-2 rounded-lg hover:text-foreground hover:bg-secondary/60 transition-all whitespace-nowrap ${location === "/contact" ? "text-foreground bg-secondary/60" : ""}`}>
                Contact Us
              </Link>
            </div>

            {/* Desktop Auth Actions */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
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
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="font-semibold" onClick={() => setLocation("/login")}>
                    Log in
                  </Button>
                  <Button size="sm" className="rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all" onClick={() => setLocation("/register")}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-0 top-[88px] bg-background border-b border-border shadow-2xl z-40 overflow-y-auto max-h-[85vh]"
          >
            <div className="p-4 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, vendors..."
                  className="w-full pl-10 h-11 rounded-xl bg-secondary/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim()) { setLocation(`/products?search=${encodeURIComponent(val.trim())}`); closeAll(); }
                    }
                  }}
                />
              </div>

              {/* 1. Home */}
              <Link href="/" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Home</Link>

              {/* 2. Categories Expandable */}
              <button
                onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                className="flex items-center justify-between w-full p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors"
              >
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${isMobileCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isMobileCategoryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 space-y-1"
                  >
                    {categoryItems.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors"
                        onClick={closeAll}
                      >
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3–8. Remaining nav links */}
              <Link href="/vendors" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/vendors" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>All Vendors</Link>
              <Link href="/products" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/products" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Product Listing</Link>
              <Link href="/products" className="flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors" onClick={closeAll}>Product Details</Link>
              <Link href="/products" className="flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors" onClick={closeAll}>Search + Filters</Link>
              <Link href="/about" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/about" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>About Us</Link>
              <Link href="/contact" className={`flex items-center p-3 font-medium text-base hover:bg-secondary/60 rounded-xl transition-colors ${location === "/contact" ? "bg-secondary/60 text-primary" : ""}`} onClick={closeAll}>Contact Us</Link>

              <div className="h-px bg-border w-full my-3" />

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

      {/* Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

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
