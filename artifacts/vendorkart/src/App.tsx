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
import VendorDashboard from "@/pages/vendor/Dashboard";
import AddProduct from "@/pages/vendor/AddProduct";
import AdminDashboard from "@/pages/admin/Dashboard";
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
      <Route path="/vendor-dashboard/:rest*" component={VendorDashboard} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />

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
