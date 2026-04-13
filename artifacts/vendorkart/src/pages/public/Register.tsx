import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Store, Mail, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
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
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectForRole(user.role, setLocation);
    }
  }, [isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), role }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep("otp");
      setOtp("");
      setResendCountdown(60);
      toast({ title: "OTP sent", description: "Check your email for the 6-digit code." });
    } catch (err: any) {
      const msg = err.name === "AbortError" ? "Request timed out. Please try again." : err.message;
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  async function verifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      login(data.user, data.token);
      toast({
        title: "Account created!",
        description: `Welcome to VendorKart, ${data.user.name}!`,
      });
      redirectForRole(data.user.role, setLocation);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (otp.length === 6) verifyOtp();
  }, [otp]);

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

          {step === "info" ? (
            <form onSubmit={sendOtp} className="space-y-5">
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
                <Label htmlFor="email">Email address</Label>
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

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email.trim() || !name.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send verification code <ArrowRight className="h-4 w-4" />
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
          ) : (
            <form onSubmit={verifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display font-bold mb-1">Verify your email</h1>
                <p className="text-muted-foreground text-sm">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="flex justify-center">
                <OTPInput
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  render={({ slots }) => (
                    <div className="flex gap-2">
                      {slots.map((slot, i) => (
                        <div
                          key={i}
                          className={`w-11 h-14 border-2 rounded-lg flex items-center justify-center text-xl font-mono font-bold transition-colors
                            ${slot.isActive ? "border-primary bg-primary/5" : "border-border bg-background"}
                            ${slot.char ? "text-foreground" : "text-muted-foreground"}
                          `}
                        >
                          {slot.char ?? (slot.isActive ? "|" : "")}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => { setStep("info"); setOtp(""); }}
                >
                  Go back
                </button>
                <button
                  type="button"
                  disabled={resendCountdown > 0}
                  onClick={() => sendOtp()}
                  className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
