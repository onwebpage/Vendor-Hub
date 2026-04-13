import { useState, useEffect } from "react";
import { SignUp } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Store } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth-store";

export default function Register() {
  const [, setLocation] = useLocation();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);

  const initialRole = (new URLSearchParams(window.location.search).get("role") as "customer" | "vendor") || "customer";
  const [role, setRole] = useState<"customer" | "vendor">(initialRole);

  // If already authenticated in our store, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") setLocation("/admin");
      else if (user.role === "vendor") setLocation("/vendor-dashboard");
      else setLocation("/customer-dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen flex bg-muted/20">
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">
            Vendor<span className="text-primary">kart</span>
          </span>
        </Link>

        <div className="w-full max-w-md mb-6">
          <Tabs value={role} onValueChange={(v) => setRole(v as "customer" | "vendor")}>
            <TabsList className="grid w-full grid-cols-2 h-14 p-1 rounded-xl bg-secondary/50">
              <TabsTrigger value="customer" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="w-4 h-4 mr-2" /> Buy Wholesale
              </TabsTrigger>
              <TabsTrigger value="vendor" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Store className="w-4 h-4 mr-2" /> Sell Products
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <SignUp
          forceRedirectUrl={`/auth-callback?role=${role}`}
          signInUrl="/login"
          unsafeMetadata={{ role }}
        />
      </div>
    </div>
  );
}

