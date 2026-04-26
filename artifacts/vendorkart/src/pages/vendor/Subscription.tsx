import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListSubscriptionPlans, useGetCurrentSubscription, useSubscribe, useGetVendorProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown, CheckCircle2, Zap, Sparkles, Package, Tag, ImageIcon,
  Star, Loader2, AlertCircle, CalendarCheck, RefreshCw,
  X, ExternalLink, QrCode, Clock, ShieldCheck,
} from "lucide-react";

const PAYMENT_LINK = "https://razorpay.me/@debabratabanerjee3358";

const planIcons: Record<string, React.ElementType> = {
  basic: Package,
  standard: Zap,
  premium: Crown,
};

const planGradients: Record<string, string> = {
  basic: "from-slate-500/10 to-slate-400/5 border-slate-500/20",
  standard: "from-blue-500/10 to-indigo-400/5 border-blue-500/20",
  premium: "from-amber-500/10 to-yellow-400/5 border-amber-500/20",
};

const planBadgeColors: Record<string, string> = {
  basic: "bg-slate-500/15 text-slate-700 border-slate-500/25",
  standard: "bg-blue-500/15 text-blue-700 border-blue-500/25",
  premium: "bg-amber-500/15 text-amber-700 border-amber-500/25",
};

function QRPaymentModal({
  plan,
  onClose,
  onConfirm,
  isLoading,
}: {
  plan: any;
  onClose: () => void;
  onConfirm: (data: { utrNumber: string; paidAmount: string; paymentScreenshot: string }) => void;
  isLoading: boolean;
}) {
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [utrNumber, setUtrNumber] = React.useState("");
  const [paidAmount, setPaidAmount] = React.useState(String(Number(plan.price)));
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit = screenshot && utrNumber.trim().length >= 6 && Number(paidAmount) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Upgrade to {plan.name}</h2>
              <p className="text-sm text-muted-foreground">Pay ₹{Number(plan.price).toLocaleString("en-IN")}/month via UPI</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your plan will be activated only after admin verifies your payment. Do not close this page until you submit.</span>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-muted/10 border border-blue-200 dark:border-blue-800/40">
            <img
              src="/qr-payment.jpg"
              alt="UPI QR Code — Debabrata Banerjee"
              className="w-48 h-auto rounded-xl shadow-md border border-white"
            />
            <p className="text-xs text-muted-foreground text-center">
              Scan with any UPI app · BHIM · GPay · PhonePe · Paytm
            </p>
            <a
              href={PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" /> Pay via Razorpay Link
            </a>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">UTR / Transaction ID <span className="text-destructive">*</span></label>
              <Input
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
                placeholder="e.g. 421234567890"
                className="rounded-xl h-10"
              />
              <p className="text-xs text-muted-foreground">Find this in your UPI app under payment details</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Amount Paid (₹) <span className="text-destructive">*</span></label>
              <Input
                type="number"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                placeholder={String(Number(plan.price))}
                className="rounded-xl h-10"
                min="1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Payment Screenshot <span className="text-destructive">*</span></label>
              {screenshot ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={screenshot} alt="Payment proof" className="w-full max-h-40 object-contain bg-muted/20" />
                  <button
                    onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          <Button
            className="w-full h-12 rounded-xl text-base font-semibold"
            onClick={() => canSubmit && onConfirm({ utrNumber: utrNumber.trim(), paidAmount, paymentScreenshot: screenshot! })}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
            ) : (
              <><Clock className="w-4 h-4 mr-2" /> Submit for Verification</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VendorSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = React.useState<any | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = React.useState<number | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useListSubscriptionPlans();
  const { data: currentSub, isLoading: subLoading } = useGetCurrentSubscription({ query: { retry: false } as any });
  const { data: vendorProfile } = useGetVendorProfile();
  const { mutateAsync: subscribe } = useSubscribe();

  const handleSubscribe = async (plan: any) => {
    if (Number(plan.price) === 0) {
      try {
        setSubscribingPlanId(plan.id);
        await subscribe({ data: { planId: plan.id } });
        await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/vendors/profile"] });
        toast({ title: "Subscribed!", description: `You are now on the ${plan.name} plan.` });
      } catch {
        toast({ variant: "destructive", title: "Failed to subscribe" });
      } finally {
        setSubscribingPlanId(null);
      }
      return;
    }
    setSelectedPlan(plan);
  };

  const handleConfirmPayment = async (data: { utrNumber: string; paidAmount: string; paymentScreenshot: string }) => {
    if (!selectedPlan) return;
    try {
      setSubscribingPlanId(selectedPlan.id);
      await subscribe({ data: { planId: selectedPlan.id, ...data } });
      await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/vendors/profile"] });
      setSelectedPlan(null);
      toast({ title: "Payment Submitted!", description: "Your payment is pending admin verification. Your plan will be activated once approved." });
    } catch {
      toast({ variant: "destructive", title: "Failed to submit payment. Please try again." });
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const isLoading = plansLoading || subLoading;

  return (
    <DashboardLayout>
      {selectedPlan && (
        <QRPaymentModal
          plan={selectedPlan}
          onClose={() => !subscribingPlanId && setSelectedPlan(null)}
          onConfirm={handleConfirmPayment}
          isLoading={!!subscribingPlanId}
        />
      )}

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscription</p>
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Manage Your Plan</h2>
          <p className="text-muted-foreground text-sm mt-1">Upgrade or change your subscription plan at any time</p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
          <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Pay via <strong>UPI QR code</strong>. Click any upgrade button to view payment instructions and submit your screenshot.
          </p>
        </div>

        {!subLoading && currentSub && currentSub.status === "pending_verification" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">
                Payment Pending Verification: <span className="text-amber-600 capitalize">{currentSub.plan?.name ?? "—"}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment screenshot has been submitted. Admin will verify and activate your plan within 24 hours.
              </p>
              {(currentSub as any).utrNumber && (
                <p className="text-xs text-muted-foreground mt-1">UTR: <span className="font-mono font-semibold">{(currentSub as any).utrNumber}</span></p>
              )}
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-amber-500/15 text-amber-700 border-amber-500/25">
              Pending
            </span>
          </motion.div>
        )}

        {!subLoading && currentSub && currentSub.status === "active" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="p-3 bg-primary/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">
                Active Plan: <span className="text-primary capitalize">{currentSub.plan?.name ?? "—"}</span>
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Started {currentSub.startDate ? new Date(currentSub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Renews {currentSub.endDate ? new Date(currentSub.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${planBadgeColors[currentSub.plan?.slug ?? "basic"] ?? planBadgeColors.basic}`}>
              Active
            </span>
          </motion.div>
        )}

        {!subLoading && !currentSub && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-400">No active subscription. Choose a plan below to unlock features.</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans as any[]).map((plan: any, i: number) => {
              const PlanIcon = planIcons[plan.slug] ?? Package;
              const isCurrentPlan = currentSub?.plan?.id === plan.id;
              const isSubscribing = subscribingPlanId === plan.id;
              const isPremium = plan.slug === "premium";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`relative bg-gradient-to-br ${planGradients[plan.slug] ?? planGradients.basic} border rounded-2xl p-6 flex flex-col ${isPremium ? "ring-2 ring-amber-500/40" : ""}`}
                >
                  {isPremium && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
                        <Star className="w-3 h-3 fill-white" /> Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl ${planBadgeColors[plan.slug] ?? planBadgeColors.basic} border`}>
                      <PlanIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{plan.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{plan.slug} tier</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-4xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}
                    </p>
                    {plan.price > 0 && <p className="text-xs text-muted-foreground mt-0.5">per month</p>}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    <FeatureRow icon={Package} text={plan.maxProducts === -1 ? "Unlimited products" : `Up to ${plan.maxProducts} products`} />
                    <FeatureRow icon={Tag} text={plan.maxCategories === -1 ? "All categories" : `Up to ${plan.maxCategories} categories`} />
                    <FeatureRow icon={ImageIcon} text="Store banner upload" enabled={plan.canUploadBanner} />
                    <FeatureRow icon={Sparkles} text="Featured listing" enabled={plan.isFeatured} />
                  </ul>

                  {isCurrentPlan ? (
                    <Button disabled className="w-full rounded-xl h-11 gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-xl h-11 gap-2"
                      variant={isPremium ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {plan.price === 0 ? "Get Started" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="bg-muted/40 border border-border/30 rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">How limits work</p>
          <p>Product and category limits are enforced when you try to add new items. Upgrading your plan takes effect immediately and allows you to list more products and unlock premium features like banner uploads and featured listings.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FeatureRow({ icon: Icon, text, enabled = true }: { icon: React.ElementType; text: string; enabled?: boolean }) {
  return (
    <li className={`flex items-center gap-2.5 text-sm ${enabled ? "text-foreground" : "text-muted-foreground/50"}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${enabled ? "bg-primary/15" : "bg-muted"}`}>
        {enabled ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <span className="w-2 h-0.5 bg-muted-foreground/30 rounded-full" />}
      </div>
      <span>{text}</span>
    </li>
  );
}
