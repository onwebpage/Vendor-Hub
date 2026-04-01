import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Package, Zap, ArrowRight, Star, Shield, Globe, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useListSubscriptionPlans } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const planIcons: Record<string, React.ElementType> = {
  basic: Package,
  standard: Zap,
  premium: Crown,
};

const planGradients: Record<string, { card: string; badge: string; btn: string; icon: string }> = {
  basic: {
    card: "border-slate-500/30 bg-card",
    badge: "bg-slate-500/15 text-slate-600 border-slate-500/25",
    btn: "variant-outline",
    icon: "from-slate-500 to-slate-600",
  },
  standard: {
    card: "border-blue-500/40 bg-gradient-to-b from-blue-500/5 to-card ring-1 ring-blue-500/20",
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/25",
    btn: "default",
    icon: "from-blue-500 to-indigo-600",
  },
  premium: {
    card: "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-card ring-1 ring-amber-500/20",
    badge: "bg-amber-500/15 text-amber-600 border-amber-500/25",
    btn: "default",
    icon: "from-amber-500 to-yellow-500",
  },
};

const faqs = [
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes, you can change your subscription plan at any time. Upgrades take effect immediately, and you'll be billed the new amount from the next cycle.",
  },
  {
    q: "How do I pay for a subscription?",
    a: "We accept UPI payments. After selecting a plan, you'll be shown a QR code and payment link. Upload your payment screenshot for instant activation.",
  },
  {
    q: "Is there a free trial?",
    a: "All vendors start on the Basic (free) plan with no time limit. You can upgrade whenever you're ready to grow.",
  },
  {
    q: "What happens when my subscription expires?",
    a: "Your store stays active but you'll be moved to the Basic plan limits until you renew. You won't lose any product data.",
  },
  {
    q: "Do customers need a subscription?",
    a: "No. Subscriptions are only for vendors who want to sell on Vendorkart. Customers can browse, buy, and compare completely free.",
  },
];

const platformFeatures = [
  { icon: Shield, title: "GST-Verified Vendors", desc: "Every vendor undergoes strict business verification before going live." },
  { icon: Globe, title: "Pan-India Reach", desc: "Reach buyers across all 28 states with doorstep delivery support." },
  { icon: Star, title: "Escrow Payments", desc: "Funds held securely until the buyer confirms delivery." },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "Premium vendors get priority support and a relationship manager." },
];

function PlanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-96 rounded-3xl" />
      ))}
    </div>
  );
}

export default function Pricing() {
  const { data: plansData, isLoading } = useListSubscriptionPlans();
  const plans: any[] = Array.isArray(plansData) ? plansData : [];

  const sorted = [...plans].sort((a, b) => Number(a.price) - Number(b.price));

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 text-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #010308 0%, #020510 60%, #010208 100%)" }} />
          <div className="absolute inset-0 opacity-[0.22]" style={{
            backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)`,
            backgroundSize: "28px 28px"
          }} />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{ width: 600, height: 600, top: -100, right: -80, background: "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{ width: 500, height: 500, bottom: -80, left: -60, background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              Vendor Subscription Plans
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
              Grow Your B2B Business<br />
              <span className="text-primary">on Your Terms</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
              Start free and scale up as you grow. Every plan includes access to India's largest verified B2B buyer network.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-6">
        {isLoading ? (
          <PlanSkeleton />
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Plans are being set up. Check back soon.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${sorted.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {sorted.map((plan: any, i: number) => {
              const key = plan.name?.toLowerCase() ?? "basic";
              const styles = planGradients[key] ?? planGradients.basic;
              const Icon = planIcons[key] ?? Package;
              const isPopular = key === "standard";
              const features: string[] = Array.isArray(plan.features) ? plan.features : [];

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`relative rounded-3xl border p-7 flex flex-col ${styles.card}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.icon} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground capitalize text-lg">{plan.name}</h3>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${styles.badge}`}>
                        {key === "basic" ? "Free Forever" : "Paid"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-display font-bold text-foreground">
                        {Number(plan.price) === 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}
                      </span>
                      {Number(plan.price) > 0 && (
                        <span className="text-muted-foreground text-sm mb-1">/month</span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-muted-foreground text-sm mt-1.5">{plan.description}</p>
                    )}
                  </div>

                  <div className="space-y-2.5 flex-1 mb-7">
                    {plan.maxProducts !== undefined && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground">
                          {plan.maxProducts === -1 ? "Unlimited products" : `Up to ${plan.maxProducts} products`}
                        </span>
                      </div>
                    )}
                    {plan.maxImages !== undefined && (
                      <div className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground">{plan.maxImages} images per product</span>
                      </div>
                    )}
                    {features.map((f: string, fi: number) => (
                      <div key={fi} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full rounded-xl gap-2 ${key === "basic" ? "variant-outline" : ""}`}
                    variant={key === "basic" ? "outline" : "default"}
                    asChild
                  >
                    <Link href={`/vendor-dashboard/subscription`}>
                      {key === "basic" ? "Get Started Free" : `Subscribe — ₹${Number(plan.price).toLocaleString("en-IN")}/mo`}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Platform Features */}
      <section className="bg-muted/30 border-y border-border/50 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Every Plan Includes</h2>
          <p className="text-muted-foreground text-sm">All vendors get access to the Vendorkart platform features from day one.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-card border border-border/50 rounded-2xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-card border border-border/50 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-foreground mb-2 text-sm">{faq.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t border-primary/20 py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground mb-3">Ready to Start Selling?</h2>
          <p className="text-muted-foreground text-sm mb-7">Join 12,000+ verified vendors already growing their B2B business on Vendorkart.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="rounded-xl gap-2" asChild>
              <Link href="/register">Start Selling Free <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" className="rounded-xl gap-2" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
