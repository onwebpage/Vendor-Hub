import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LifeBuoy, MessageSquare, Clock, CheckCircle2, AlertCircle,
  ChevronDown, Loader2, Send, HelpCircle,
} from "lucide-react";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(20, "Please describe your issue in at least 20 characters"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: Date;
}

const categories = [
  "Account & Profile",
  "Product Listing",
  "Order & Payments",
  "Subscription",
  "Technical Issue",
  "Other",
];

const statusConfig = {
  open: { label: "Open", icon: AlertCircle, pill: "text-amber-700 bg-amber-500/10 border-amber-400/30" },
  "in-progress": { label: "In Progress", icon: Clock, pill: "text-blue-700 bg-blue-500/10 border-blue-400/30" },
  resolved: { label: "Resolved", icon: CheckCircle2, pill: "text-emerald-700 bg-emerald-500/10 border-emerald-400/30" },
};

const faqs = [
  {
    q: "How do I get my vendor account approved?",
    a: "After registering, your account is reviewed by an admin. This typically takes 1–2 business days. You'll receive a notification once your account is approved or if additional information is needed.",
  },
  {
    q: "How do I upgrade my subscription plan?",
    a: "Go to Subscription in your dashboard sidebar. You'll see all available plans with their features. Click 'Upgrade' on any plan to proceed with payment via Razorpay.",
  },
  {
    q: "Why is my product showing as 'Under Review'?",
    a: "All newly listed products are reviewed by admins before going live. This ensures quality standards across the marketplace. Reviews typically complete within 24 hours.",
  },
  {
    q: "How do I set up UPI payments for my store?",
    a: "Go to Store Settings and scroll to the UPI Payment section. Enter your UPI ID and optionally your QR code image URL. Buyers will see this information when making payments.",
  },
  {
    q: "How are my earnings calculated?",
    a: "Your earnings are based on the items from your store that buyers purchase. You can see a full breakdown in the Payments section, including monthly earnings charts and per-order details.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-border/40 rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VendorSupport() {
  const { toast } = useToast();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", category: "", message: "" },
  });

  async function onSubmit(values: TicketFormValues) {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const newTicket: Ticket = {
      id: `TKT-${String(Math.floor(1000 + Math.random() * 9000))}`,
      subject: values.subject,
      category: values.category,
      message: values.message,
      status: "open",
      createdAt: new Date(),
    };
    setTickets((prev) => [newTicket, ...prev]);
    form.reset();
    setSubmitting(false);
    toast({ title: "Ticket submitted!", description: `Your ticket ${newTicket.id} has been created. We'll respond within 24 hours.` });
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <LifeBuoy className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Help Center</p>
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight">Vendor Support</h2>
          <p className="text-muted-foreground text-sm mt-1">Get help with your store, products, and payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form + Tickets */}
          <div className="lg:col-span-3 space-y-6">
            {/* Submit Ticket */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">Submit a Support Ticket</h3>
              </div>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brief description of your issue" className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your issue in detail — include any error messages, steps to reproduce, or order numbers..."
                            rows={5}
                            className="rounded-xl resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            {/* My Tickets */}
            {tickets.length > 0 && (
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">My Tickets</h3>
                </div>
                <div className="divide-y divide-border/30">
                  {tickets.map((ticket) => {
                    const s = statusConfig[ticket.status];
                    const StatusIcon = s.icon;
                    return (
                      <div key={ticket.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-sm">{ticket.subject}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {ticket.id} · {ticket.category} · {ticket.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{ticket.message}</p>
                          </div>
                          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.pill}`}>
                            <StatusIcon className="w-3 h-3" />
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: FAQ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Frequently Asked Questions</h3>
            </div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mt-2">
              <p className="text-sm font-semibold text-foreground mb-1">Need urgent help?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For account suspension or payment disputes, email us at{" "}
                <span className="text-primary font-medium">support@vendorkart.in</span>. We aim to respond within 4 business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
