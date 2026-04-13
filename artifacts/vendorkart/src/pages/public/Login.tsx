import { SignIn, useAuth } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);

  // If already authenticated in our store, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isAuthenticated && user) {
      if (user.role === "admin") setLocation("/admin");
      else if (user.role === "vendor") setLocation("/vendor-dashboard");
      else setLocation("/customer-dashboard");
    }
  }, [isLoaded, isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center items-center px-4 bg-background">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">
            Vendor<span className="text-primary">kart</span>
          </span>
        </Link>
        <SignIn
          forceRedirectUrl="/auth-callback"
          signUpUrl="/register"
        />
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-foreground">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="B2B Network"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
        <div className="absolute bottom-24 left-16 right-16">
          <div className="bg-background/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-white">
            <h3 className="text-2xl font-display font-bold mb-4">"Vendorkart transformed our procurement process."</h3>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              We now source high-quality industrial components directly from manufacturers at 20% lower costs.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl">S</div>
              <div>
                <div className="font-bold">Sarah Jenkins</div>
                <div className="text-sm text-white/60">Procurement Director, TechManufacturing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

