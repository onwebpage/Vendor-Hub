import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Store, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function redirectForRole(role: string, setLocation: (to: string) => void) {
  if (role === "admin") setLocation("/admin");
  else if (role === "vendor") setLocation("/vendor-dashboard");
  else setLocation("/customer-dashboard");
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, login } = useAuthStore();
  const { toast } = useToast();

  const initialRole =
    (new URLSearchParams(window.location.search).get("role") as "customer" | "vendor") || "customer";

  const [role, setRole] = useState<"customer" | "vendor">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectForRole(user.role, setLocation);
    }
  }, [isAuthenticated, user, setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      login(data.user, data.token);
      toast({
        title: "Account created!",
        description: `Welcome to VendorKart, ${data.user.name}!`,
      });
      redirectForRole(data.user.role, setLocation);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Vendor<span className="text-primary">kart</span>
            </span>
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-display font-bold mb-1">Create your account</h1>
              <p className="text-muted-foreground text-sm">Join India's leading B2B marketplace</p>
            </div>

            <Tabs value={role} onValueChange={(v) => setRole(v as "customer" | "vendor")}>
              <TabsList className="grid w-full grid-cols-2 h-14 p-1 rounded-xl bg-secondary/50">
                <TabsTrigger
                  value="customer"
                  className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <User className="w-4 h-4 mr-2" /> Buy Wholesale
                </TabsTrigger>
                <TabsTrigger
                  value="vendor"
                  className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Store className="w-4 h-4 mr-2" /> Sell Products
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder={role === "vendor" ? "Business or your name" : "Your full name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Enter your email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Enter your password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading || !name.trim() || !email.trim() || !password}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
