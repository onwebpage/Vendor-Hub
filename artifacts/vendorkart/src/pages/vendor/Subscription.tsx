import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListSubscriptionPlans, useGetCurrentSubscription, useSubscribe, useGetVendorProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown, CheckCircle2, Zap, Sparkles, Package, Tag, ImageIcon,
  Star, Loader2, AlertCircle, CalendarCheck, RefreshCw,
} from "lucide-react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function VendorSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subscribingPlanId, setSubscribingPlanId] = React.useState<number | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useListSubscriptionPlans();
  const { data: currentSub, isLoading: subLoading } = useGetCurrentSubscription({ query: { retry: false } });
  const { data: vendorProfile } = useGetVendorProfile();
  const { mutateAsync: subscribe } = useSubscribe();

  const handleSubscribe = async (planId: number, price: number, planName: string) => {
    if (price === 0) {
      try {
        setSubscribingPlanId(planId);
        await subscribe({ data: { planId } });
        await queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/current"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/vendors/profile"] });
        toast({ title: "Subscribed!", description: `You are now on the ${planName} plan.` });
      } catch {
        toast({ variant: "destructive", title: "Failed to subscribe" });
      } finally {
        setSubscribingPlanId(null);
      }
      return;
    }

    toast({
      title: "Payment Gateway — Under Development",
      description: "Razorpay integration is coming soon. Please contact support to upgrade manually.",
      variant: "destructive",
    });
  };

  const isLoading = plansLoading || subLoading;

  return (
    <DashboardLayout>
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

        {/* Current Plan Banner */}
        {!subLoading && currentSub && (
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
              {currentSub.status === "active" ? "Active" : currentSub.status}
            </span>
          </motion.div>
        )}

        {!subLoading && !currentSub && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-400">No active subscription. Choose a plan below to unlock features.</p>
          </div>
        )}

        {/* Plans */}
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
                      onClick={() => handleSubscribe(plan.id, Number(plan.price), plan.name)}
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

        {/* Feature comparison note */}
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
