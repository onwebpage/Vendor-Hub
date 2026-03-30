import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, MessageSquare,
  Building2, HeadphonesIcon, Send, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91 98765 43210", "+91 80000 12345"],
    sub: "Mon–Sat, 9 AM – 7 PM",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Mail,
    title: "Email Us",
    lines: ["support@vendorkart.in", "vendors@vendorkart.in"],
    sub: "Reply within 24 hours",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: MapPin,
    title: "Head Office",
    lines: ["Level 8, Platina Building,", "Bandra Kurla Complex, Mumbai 400051"],
    sub: "Maharashtra, India",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Clock,
    title: "Business Hours",
    lines: ["Mon – Fri: 9:00 AM – 8:00 PM", "Saturday: 10:00 AM – 6:00 PM"],
    sub: "Sunday: Closed",
    color: "from-amber-500 to-orange-500",
  },
];

const supportTypes = [
  { icon: MessageSquare, title: "General Inquiry", desc: "Questions about Vendorkart, pricing, or features", color: "text-blue-400" },
  { icon: Building2, title: "Vendor Support", desc: "Help with your vendor account, listings, or orders", color: "text-violet-400" },
  { icon: HeadphonesIcon, title: "Buyer Support", desc: "Help with purchases, returns, or disputes", color: "text-emerald-400" },
];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "", message: "", type: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#03050d] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full mb-6 border border-indigo-500/25 bg-indigo-500/8">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Get in Touch</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-5">
              We're Here to <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Help</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              Have a question, need support, or want to explore a partnership? Our team is ready to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Types */}
      <section className="bg-[#080c14] py-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {supportTypes.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
              >
                <s.icon className={`w-6 h-6 ${s.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="text-white font-bold text-sm">{s.title}</p>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-extrabold text-foreground mb-2">Contact Information</h2>
              <p className="text-muted-foreground mb-8">Reach out through any of these channels and we'll get back to you promptly.</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-2xl border border-border p-5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-2">{info.title}</h3>
                    {info.lines.map((line, j) => (
                      <p key={j} className="text-sm text-foreground">{line}</p>
                    ))}
                    <p className="text-xs text-muted-foreground mt-1">{info.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="rounded-2xl border border-border overflow-hidden bg-muted h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Bandra Kurla Complex, Mumbai</p>
                  <p className="text-muted-foreground/60 text-xs">Maharashtra, India 400051</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thanks for reaching out. Our team will respond within 24 hours.
                    </p>
                    <Button variant="outline" className="rounded-xl" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "", type: "" }); }}>
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Send Us a Message</h2>
                    <p className="text-muted-foreground text-sm mb-7">Fill out the form and we'll respond within 24 hours.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                          <Input
                            id="name"
                            placeholder="Rajesh Mehta"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="rounded-xl h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="rajesh@company.in"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="rounded-xl h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="rounded-xl h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Query Type</Label>
                          <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                            <SelectTrigger className="rounded-xl h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="vendor">Vendor Support</SelectItem>
                              <SelectItem value="buyer">Buyer Support</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="billing">Billing / Payments</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help you?"
                          value={form.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Tell us more about your query or requirement..."
                          value={form.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 transition-all"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={loading}>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" /> Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
