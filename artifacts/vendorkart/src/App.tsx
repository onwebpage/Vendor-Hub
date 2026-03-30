import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/public/Home";
import Products from "@/pages/public/Products";
import ProductDetail from "@/pages/public/ProductDetail";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import CustomerDashboard from "@/pages/customer/Dashboard";
import Cart from "@/pages/customer/Cart";
import CustomerOrders from "@/pages/customer/Orders";
import CustomerWishlist from "@/pages/customer/Wishlist";
import CustomerProfile from "@/pages/customer/Profile";
import AddressBook from "@/pages/customer/AddressBook";
import PaymentHistory from "@/pages/customer/PaymentHistory";
import CustomerNotifications from "@/pages/customer/Notifications";
import CustomerSupport from "@/pages/customer/Support";
import VendorDashboard from "@/pages/vendor/Dashboard";
import AddProduct from "@/pages/vendor/AddProduct";
import VendorProducts from "@/pages/vendor/Products";
import VendorOrders from "@/pages/vendor/Orders";
import VendorCategories from "@/pages/vendor/Categories";
import VendorPayments from "@/pages/vendor/Payments";
import StoreSettings from "@/pages/vendor/StoreSettings";
import VendorNotifications from "@/pages/vendor/Notifications";
import VendorSubscription from "@/pages/vendor/Subscription";
import VendorSupport from "@/pages/vendor/Support";
import AdminPanel from "@/pages/admin/AdminPanel";
import AdminLogin from "@/pages/admin/Login";
import Vendors from "@/pages/public/Vendors";
import VendorStore from "@/pages/public/VendorStore";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/vendors/:slug" component={VendorStore} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Customer (Guards would normally go in a wrapper component, keeping simple for artifact) */}
      <Route path="/customer-dashboard" component={CustomerDashboard} />
      <Route path="/customer-dashboard/cart" component={Cart} />
      {/* Fallback routing for uncreated subpages routes them to dashboard for demo */}
      <Route path="/customer-dashboard/:rest*" component={CustomerDashboard} />

      {/* Vendor */}
      <Route path="/vendor-dashboard" component={VendorDashboard} />
      <Route path="/vendor-dashboard/add-product" component={AddProduct} />
      <Route path="/vendor-dashboard/products" component={VendorProducts} />
      <Route path="/vendor-dashboard/orders" component={VendorOrders} />
      <Route path="/vendor-dashboard/categories" component={VendorCategories} />
      <Route path="/vendor-dashboard/payments" component={VendorPayments} />
      <Route path="/vendor-dashboard/store-settings" component={StoreSettings} />
      <Route path="/vendor-dashboard/notifications" component={VendorNotifications} />
      <Route path="/vendor-dashboard/subscription" component={VendorSubscription} />
      <Route path="/vendor-dashboard/support" component={VendorSupport} />
      <Route path="/vendor-dashboard/:rest*" component={VendorDashboard} />

      {/* Admin */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/:rest*" component={AdminPanel} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
