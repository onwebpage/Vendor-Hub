import React from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth-store";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Settings, 
  CreditCard, Bell, LifeBuoy, LogOut, Store, Menu, Tag, Tags, FileText, Heart, Activity, MapPin, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

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
          { icon: LayoutDashboard, label: "Dashboard", href: "/vendor-dashboard" },
          { icon: Package, label: "Products", href: "/vendor-dashboard/products" },
          { icon: ShoppingBag, label: "Orders", href: "/vendor-dashboard/orders" },
          { icon: Tag, label: "Categories", href: "/vendor-dashboard/categories" },
          { icon: CreditCard, label: "Payments", href: "/vendor-dashboard/payments" },
          { icon: Store, label: "Store Settings", href: "/vendor-dashboard/store-settings" },
          { icon: Bell, label: "Notifications", href: "/vendor-dashboard/notifications" },
          { icon: Crown, label: "Subscription", href: "/vendor-dashboard/subscription" },
          { icon: LifeBuoy, label: "Support", href: "/vendor-dashboard/support" },
        ];
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Overview", href: "/admin" },
          { icon: Store, label: "Vendors", href: "/admin/vendors" },
          { icon: Users, label: "Customers", href: "/admin/customers" },
          { icon: Package, label: "Products", href: "/admin/products" },
          { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
          { icon: Tags, label: "Categories", href: "/admin/categories" },
          { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
          { icon: FileText, label: "Coupons", href: "/admin/coupons" },
          { icon: Activity, label: "Activity Logs", href: "/admin/activity-logs" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border/50 shadow-xl transition-all duration-300"
      >
        <div className="h-20 flex items-center px-6 border-b border-border/50 justify-between">
          <Link href="/" className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shrink-0">
              <Store className="h-6 w-6" />
            </div>
            {isSidebarOpen && (
              <span className="font-display font-bold text-xl tracking-tight text-foreground whitespace-nowrap">
                Vendor<span className="text-primary">kart</span>
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'}`} />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'}`}>
        {/* Header */}
        <header className="h-20 bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-display font-bold capitalize hidden sm:block">
              {location.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background"></span>
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
