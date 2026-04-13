import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingBag, Loader2, Store, User, MapPin, ShieldCheck, MailCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = (searchParams.get('role') as 'customer' | 'vendor') || 'customer';
  
  const { toast } = useToast();
  const login = useAuthStore(s => s.login);
  const [role, setRole] = useState<'customer' | 'vendor'>(initialRole);
  const [isPending, setIsPending] = useState(false);

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingToken, setPendingToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingAddress, setPendingAddress] = useState<null | Record<string, string>>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split("")); otpRefs.current[5]?.focus(); }
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

      if (pendingAddress && data.token) {
        try {
          await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` },
            body: JSON.stringify(pendingAddress),
          });
        } catch {}
      }

      toast({ title: "Email verified!", description: "Welcome to Vendorkart." });
      if (data.user.role === "vendor") setLocation("/vendor-dashboard");
      else setLocation("/customer-dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification failed", description: error.message });
    } finally {
      setOtpLoading(false);
    }
  };

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", email: "", password: "", phone: "",
      businessName: "", businessDescription: "",
      addressLine1: "", city: "", state: "", pincode: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (role === 'vendor' && !data.businessName) {
      form.setError('businessName', { message: "Business name is required for vendors" });
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }),
      });
      const response = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({ variant: "destructive", title: "Registration failed", description: response.message || "Please check your details and try again." });
        return;
      }

      if (response.requiresEmailVerification) {
        setPendingToken(response.pendingToken);
        setPendingEmail(data.email);
        if (role === 'customer' && (data.addressLine1 || data.city || data.pincode)) {
          setPendingAddress({
            name: data.name,
            phone: data.phone || '',
            addressLine1: data.addressLine1 || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
            country: 'India',
            isDefault: 'true',
          });
        }
        setStep('otp');
        if (response.devOtp) {
          setOtp(String(response.devOtp).split(""));
          toast({ title: "Dev mode: code auto-filled", description: `OTP: ${response.devOtp}` });
        } else {
          toast({ title: "Check your email!", description: "We've sent a 6-digit code to verify your account." });
        }
        return;
      }

      toast({ title: "Account created!", description: "Welcome to Vendorkart." });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration failed", description: error.message || "Please check your details and try again." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-muted/20">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md bg-card p-8 sm:p-10 rounded-3xl shadow-xl border border-border">
          <Link href="/" className="flex justify-center items-center gap-2 mb-8">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Vendor<span className="text-primary">kart</span>
            </span>
          </Link>

          {step === 'otp' ? (
            <div>
              <div className="text-center mb-8">
                <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <MailCheck className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">Verify your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We sent a 6-digit code to <strong className="text-foreground">{pendingEmail}</strong>
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-8" onPaste={handleOtpPaste}>
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
                    className="w-12 h-14 text-center text-2xl font-bold border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.join("").length !== 6}
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                Verify &amp; Create Account
              </Button>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtp(["", "", "", "", "", ""]); }}
                  className="font-semibold text-primary hover:underline"
                >
                  Go back
                </button>
              </div>
            </div>
          ) : (
          <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="mt-2 text-muted-foreground">Join the B2B marketplace today.</p>
          </div>

          <Tabs value={role} onValueChange={(v) => setRole(v as 'customer' | 'vendor')} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 h-14 p-1 rounded-xl bg-secondary/50">
              <TabsTrigger value="customer" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="w-4 h-4 mr-2" /> Buy Wholesale
              </TabsTrigger>
              <TabsTrigger value="vendor" className="rounded-lg text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Store className="w-4 h-4 mr-2" /> Sell Products
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Email</FormLabel>
                    <FormControl><Input placeholder="john@company.com" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+91 9876543210" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'vendor' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business/Company Name *</FormLabel>
                        <FormControl><Input placeholder="Acme Industries Ltd." className="h-12 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl><Textarea placeholder="What do you manufacture or sell?" className="rounded-xl resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {role === 'customer' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Delivery Address</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street / Area</FormLabel>
                        <FormControl><Input placeholder="123, MG Road, Koramangala" className="h-12 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl><Input placeholder="Bengaluru" className="h-12 rounded-xl" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl><Input placeholder="Karnataka" className="h-12 rounded-xl" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl><Input placeholder="560001" className="h-12 rounded-xl" maxLength={6} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 mt-6" disabled={isPending}>
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Create {role === 'vendor' ? 'Vendor' : 'Customer'} Account
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in instead
            </Link>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
