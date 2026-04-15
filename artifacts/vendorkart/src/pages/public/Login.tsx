import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { REGEXP_ONLY_DIGITS } from "input-otp";

function redirectForRole(role: string, setLocation: (to: string) => void) {
  if (role === "admin") setLocation("/admin");
  else if (role === "vendor") setLocation("/vendor-dashboard");
  else setLocation("/customer-dashboard");
}

type Step = "email" | "otp";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, login } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectForRole(user.role, setLocation);
    }
  }, [isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");
      setStep("otp");
      setResendCooldown(60);
      toast({ title: "Code sent!", description: `Check your inbox at ${email.trim()}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
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

  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code");
      setResendCooldown(60);
      setOtp("");
      toast({ title: "Code resent!", description: "A new code has been sent to your inbox." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
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
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display font-bold mb-1">Welcome back</h1>
                <p className="text-muted-foreground text-sm">Enter your email to receive a sign-in code</p>
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

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email.trim()}
              >
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
            <div className="space-y-5">
              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 mx-auto"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="text-2xl font-display font-bold mb-1">Check your email</h1>
                <p className="text-muted-foreground text-sm">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (val.length === 6) {
                      setTimeout(() => {
                        (document.activeElement as HTMLElement)?.blur();
                      }, 50);
                    }
                  }}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                    <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="button"
                className="w-full gap-2"
                disabled={loading || otp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify & sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>
            </div>
          )}
        </div>
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
