import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Mail, ArrowRight, RotateCcw, Loader2, User, Store } from "lucide-react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
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

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, login } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
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
    if (!email.trim()) return;
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
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
      toast({ title: "Welcome back!", description: `Signed in as ${data.user.name}.` });
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
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-background">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Vendor<span className="text-primary">kart</span>
            </span>
          </Link>

          {step === "email" ? (
            <form onSubmit={sendOtp} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display font-bold mb-1">Welcome back</h1>
                <p className="text-muted-foreground text-sm">
                  Sign in to your {role === "vendor" ? "Vendor" : "Customer"} dashboard
                </p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    role === "customer"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("vendor")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    role === "vendor"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Vendor
                </button>
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
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading || !email.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send code <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display font-bold mb-1">Enter your code</h1>
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
                    Verify &amp; sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={() => { setStep("email"); setOtp(""); }}
                >
                  Change email
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

      {/* Right panel — decorative */}
      <div className="hidden lg:block relative w-0 flex-1 bg-foreground">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="B2B Network"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
        <div className="absolute bottom-24 left-16 right-16">
          <div className="bg-background/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-white">
            <h3 className="text-2xl font-display font-bold mb-4">
              "Vendorkart transformed our procurement process."
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              We now source high-quality industrial components directly from manufacturers at 20% lower costs.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl">
                S
              </div>
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
