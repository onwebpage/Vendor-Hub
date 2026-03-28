import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Search, Menu, X, User as UserIcon, 
  Package, Store, Heart, LogOut, LayoutDashboard 
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

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-xs font-medium tracking-wide">
        B2B Wholesale Marketplace: Get 10% off your first bulk order with code <span className="font-bold">WELCOME10</span>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                Vendor<span className="text-primary">kart</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search products, vendors, categories..." 
                  className="w-full pl-10 pr-4 py-6 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 shadow-inner text-base transition-all duration-300"
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                <Link href="/vendors" className="hover:text-foreground transition-colors">Vendors</Link>
                <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
              </nav>

              <div className="h-8 w-px bg-border mx-2"></div>

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  {user?.role === 'customer' && (
                    <>
                      <Link href="/customer-dashboard/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="h-6 w-6" />
                      </Link>
                      <Link href="/customer-dashboard/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                        <ShoppingBag className="h-6 w-6" />
                        <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full border-2 border-background">3</span>
                      </Link>
                    </>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="font-semibold" onClick={() => setLocation("/login")}>
                    Log in
                  </Button>
                  <Button className="rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all" onClick={() => setLocation("/register")}>
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4">
               {isAuthenticated && user?.role === 'customer' && (
                  <Link href="/customer-dashboard/cart" className="relative p-2 text-foreground">
                    <ShoppingBag className="h-6 w-6" />
                  </Link>
               )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-20 bg-background border-b border-border shadow-xl z-40 p-4"
          >
            <div className="space-y-4">
              <Input placeholder="Search..." className="w-full py-6 rounded-xl bg-secondary/50" />
              <nav className="flex flex-col space-y-2">
                <Link href="/products" className="p-3 font-medium text-lg hover:bg-secondary rounded-xl">Products</Link>
                <Link href="/vendors" className="p-3 font-medium text-lg hover:bg-secondary rounded-xl">Vendors</Link>
                <Link href="/categories" className="p-3 font-medium text-lg hover:bg-secondary rounded-xl">Categories</Link>
              </nav>
              <div className="h-px bg-border w-full"></div>
              {isAuthenticated ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 font-medium text-muted-foreground">Signed in as {user?.name}</div>
                  <Button variant="outline" className="w-full justify-start rounded-xl py-6" onClick={() => setLocation(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                  </Button>
                  <Button variant="destructive" className="w-full justify-start rounded-xl py-6" onClick={handleLogout}>
                    <LogOut className="mr-2 h-5 w-5" /> Log out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" className="rounded-xl py-6" onClick={() => { setLocation("/login"); setIsMobileMenuOpen(false); }}>Log in</Button>
                  <Button className="rounded-xl py-6" onClick={() => { setLocation("/register"); setIsMobileMenuOpen(false); }}>Sign up</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <span className="font-display font-bold text-2xl tracking-tight">Vendor<span className="text-primary">kart</span></span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-muted-foreground">
                The premier B2B multi-vendor marketplace connecting businesses with verified wholesale suppliers globally.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Marketplace</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/vendors" className="hover:text-primary transition-colors">Verified Vendors</Link></li>
                <li><Link href="/categories" className="hover:text-primary transition-colors">Categories A-Z</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">For Business</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/register?role=vendor" className="hover:text-primary transition-colors">Sell on Vendorkart</Link></li>
                <li><Link href="/register?role=customer" className="hover:text-primary transition-colors">Buy Wholesale</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center / FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
