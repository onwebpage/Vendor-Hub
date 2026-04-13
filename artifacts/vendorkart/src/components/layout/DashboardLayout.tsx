import React from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";

import { useAuthStore } from "@/lib/auth-store";
import { useVendorBase } from "@/lib/use-vendor-base";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Settings, 
  CreditCard, Bell, LifeBuoy, LogOut, Store, Menu, Tag, Tags, FileText, Heart, Activity, MapPin, Crown, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout: storeLogout } = useAuthStore();
  const { signOut } = useClerk();
  const [isDesktopExpanded, setDesktopExpanded] = React.useState(true);
  const [isMobileOpen, setMobileOpen] = React.useState(false);
  const { base: vendorBase } = useVendorBase();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  React.useEffect(() => {
    if (user?.role === 'vendor' && vendorBase !== '/vendor-dashboard' && location.startsWith('/vendor-dashboard')) {
      const subPath = location.replace('/vendor-dashboard', '');
      setLocation(vendorBase + subPath, { replace: true });
    }
  }, [vendorBase, location, user?.role]);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case "customer":
        return [
          { icon: LayoutDashboard, label: "Overview",         href: "/customer-dashboard" },
          { icon: Package,          label: "My Orders",        href: "/customer-dashboard/orders" },
          { icon: Heart,            label: "Wishlist",         href: "/customer-dashboard/wishlist" },
          { icon: ShoppingBag,      label: "Cart",             href: "/customer-dashboard/cart" },
          { icon: MapPin,           label: "Address Book",     href: "/customer-dashboard/addresses" },
          { icon: CreditCard,       label: "Payment History",  href: "/customer-dashboard/payments" },
          { icon: Bell,             label: "Notifications",    href: "/customer-dashboard/notifications" },
          { icon: LifeBuoy,         label: "Support",          href: "/customer-dashboard/support" },
          { icon: Settings,         label: "Profile",          href: "/customer-dashboard/profile" },
        ];
      case "vendor":
        return [
          { icon: LayoutDashboard, label: "Dashboard",       href: vendorBase },
          { icon: Package,         label: "Products",         href: `${vendorBase}/products` },
          { icon: ShoppingBag,     label: "Orders",           href: `${vendorBase}/orders` },
          { icon: Tag,             label: "Categories",       href: `${vendorBase}/categories` },
          { icon: CreditCard,      label: "Payments",         href: `${vendorBase}/payments` },
          { icon: Store,           label: "Store Settings",   href: `${vendorBase}/store-settings` },
          { icon: Bell,            label: "Notifications",    href: `${vendorBase}/notifications` },
          { icon: Crown,           label: "Subscription",     href: `${vendorBase}/subscription` },
          { icon: LifeBuoy,        label: "Support",          href: `${vendorBase}/support` },
        ];
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Overview",       href: "/admin" },
          { icon: Store,           label: "Vendors",         href: "/admin/vendors" },
          { icon: Users,           label: "Customers",       href: "/admin/customers" },
          { icon: Package,         label: "Products",        href: "/admin/products" },
          { icon: ShoppingBag,     label: "Orders",          href: "/admin/orders" },
          { icon: Tags,            label: "Categories",      href: "/admin/categories" },
          { icon: CreditCard,      label: "Subscriptions",   href: "/admin/subscriptions" },
          { icon: FileText,        label: "Coupons",         href: "/admin/coupons" },
          { icon: Activity,        label: "Activity Logs",   href: "/admin/activity-logs" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await signOut();
    storeLogout();
    setLocation("/");
  };

  const SidebarContent = ({ showLabels }: { showLabels: boolean }) => (
    <>
      <div className="h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-border/50 justify-between flex-shrink-0">
        <Link href="/" className={`flex items-center gap-3 overflow-hidden ${!showLabels && 'justify-center w-full'}`}>
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shrink-0">
            <Store className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          {showLabels && (
            <span className="font-display font-bold text-xl tracking-tight text-foreground whitespace-nowrap">
              Vendor<span className="text-primary">kart</span>
            </span>
          )}
        </Link>
        <button
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 md:py-6 px-3 md:px-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${!showLabels ? 'justify-center' : ''}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'}`} />
              {showLabels && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 md:p-4 border-t border-border/50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 md:py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ${!showLabels ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {showLabels && <span className="font-medium">Log out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar (slide-in overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-card border-r border-border/50 shadow-2xl md:hidden"
          >
            <SidebarContent showLabels />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always mounted, animates width) */}
      <motion.aside
        initial={false}
        animate={{ width: isDesktopExpanded ? 280 : 80 }}
        className="fixed inset-y-0 left-0 z-50 hidden md:flex flex-col bg-card border-r border-border/50 shadow-xl overflow-hidden"
      >
        <SidebarContent showLabels={isDesktopExpanded} />
      </motion.aside>

      {/* Main Content Area */}
      <div className={`md:transition-all md:duration-300 ${isDesktopExpanded ? 'md:pl-[280px]' : 'md:pl-[80px]'}`}>
        {/* Header */}
        <header className="h-14 md:h-20 bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="rounded-full md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopExpanded(!isDesktopExpanded)}
              className="rounded-full hidden md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base md:text-xl font-display font-bold capitalize hidden sm:block">
              {navItems.find(item => item.href === location)?.label ||
               location.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="outline" size="icon" className="rounded-full relative h-8 w-8 md:h-10 md:w-10">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 md:h-2.5 md:w-2.5 bg-destructive rounded-full border-2 border-background"></span>
            </Button>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 text-sm md:text-base">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
