import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag, ArrowRight, Loader2, Store, User, ShieldCheck, MailCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useAuthStore(s => s.login);
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [pendingToken, setPendingToken] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message || "Login failed");

      if (response.requires2FA) {
        setPendingToken(response.pendingToken);
        setStep('otp');
        if (response.devOtp) {
          setOtp(String(response.devOtp).split(""));
          toast({ title: "Dev mode: code auto-filled", description: `OTP: ${response.devOtp}` });
        } else {
          toast({ title: "Check your email", description: "A 6-digit verification code has been sent to your email." });
        }
        return;
      }

      if (!response.user || !response.token) {
        throw new Error(response.message || "Login failed");
      }

      if (response.user.role !== role && response.user.role !== 'admin') {
        toast({ title: "Note", description: `Logged in as ${response.user.role}.` });
      }

      login(response.user, response.token);
      toast({ title: "Welcome back!", description: "Successfully logged in." });

      if (response.user.role === 'admin') setLocation('/admin');
      else if (response.user.role === 'vendor') setLocation('/vendor-dashboard');
      else setLocation('/customer-dashboard');

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({ variant: "destructive", title: "Enter the full 6-digit code" });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      login(data.user, data.token);
      toast({ title: "Welcome back!", description: "Successfully logged in." });

      if (data.user.role === 'admin') setLocation('/admin');
      else if (data.user.role === 'vendor') setLocation('/vendor-dashboard');
      else setLocation('/customer-dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification failed", description: error.message });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setStep('credentials');
    setOtp(["", "", "", "", "", ""]);
    setPendingToken("");
    toast({ description: "Please log in again to resend the code." });
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[600px] xl:w-[700px] bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-[450px]">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Vendor<span className="text-primary">kart</span>
            </span>
          </Link>

          {step === 'credentials' ? (
            <>
              <div>
                <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Sign in to your account</h2>
                <p className="mt-2 text-muted-foreground">Welcome back! Please enter your details.</p>
              </div>

              <div className="mt-8">
                <Tabs value={role} onValueChange={(v) => setRole(v as 'customer' | 'vendor')} className="mb-8">
                  <TabsList className="grid w-full grid-cols-2 h-14 p-1 rounded-xl bg-secondary/50">
                    <TabsTrigger value="customer" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <User className="w-4 h-4 mr-2" /> Buyer
                    </TabsTrigger>
                    <TabsTrigger value="vendor" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <Store className="w-4 h-4 mr-2" /> Supplier
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email address</FormLabel>
                          <FormControl>
                            <Input placeholder="name@company.com" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-foreground">Password</FormLabel>
                            <a href="#" className="text-sm font-semibold text-primary hover:underline">
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="h-12 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href={`/register?role=${role}`} className="font-semibold text-primary hover:underline">
                    Create an account
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MailCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Check your email</h2>
                <p className="mt-2 text-muted-foreground max-w-xs">
                  We sent a 6-digit verification code to <span className="font-semibold text-foreground">{form.getValues("email")}</span>. Enter it below to continue.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Verification code</p>
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">Code expires in 10 minutes</p>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.join("").length !== 6}
                  className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
                >
                  {otpLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                  Verify &amp; Sign In
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-semibold text-primary hover:underline"
                  >
                    Go back and try again
                  </button>
                </div>
              </div>
            </>
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
            <h3 className="text-2xl font-display font-bold mb-4">"Vendorkart transformed our procurement process."</h3>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              We now source high-quality industrial components directly from manufacturers at 20% lower costs, all through a single secure platform.
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
