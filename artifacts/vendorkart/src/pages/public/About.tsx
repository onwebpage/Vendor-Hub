import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Shield, Zap, Globe, Users, TrendingUp, Award,
  CheckCircle2, ArrowRight, Building2, Target,
  Linkedin, Twitter, Github, Instagram, ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

const stats = [
  { value: "12,000+", label: "Verified Vendors", icon: Building2, color: "text-blue-400" },
  { value: "2.4L+", label: "B2B Buyers", icon: Users, color: "text-violet-400" },
  { value: "₹850Cr+", label: "Trade Volume", icon: TrendingUp, color: "text-emerald-400" },
  { value: "28", label: "States Covered", icon: Globe, color: "text-amber-400" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Every vendor is GST-verified and background-checked. We maintain zero tolerance for fraud and ensure every transaction is secure.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Zap,
    title: "Efficiency First",
    desc: "Our smart matching engine connects buyers with the right suppliers in minutes, not days. Bulk procurement made effortless.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Globe,
    title: "Pan-India Reach",
    desc: "With vendors across all 28 states, we ensure you always find the best price and availability, no matter where you are.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Target,
    title: "Built for Growth",
    desc: "From small businesses to large enterprises, our platform scales with your procurement needs and helps you grow faster.",
    color: "from-violet-500 to-purple-600",
  },
];

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

function useTeamMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { members, loading };
}

const milestones = [
  { year: "2020", event: "Vendorkart founded with 50 vendors in Mumbai" },
  { year: "2021", event: "Expanded to 10 states with 1,000+ verified vendors" },
  { year: "2022", event: "Launched escrow payment system and crossed ₹50Cr GMV" },
  { year: "2023", event: "Reached 5,000+ vendors and ₹300Cr in annual trade volume" },
  { year: "2024", event: "Pan-India presence with 12,000+ vendors and ₹850Cr+ GMV" },
];

export default function About() {
  const { members, loading: teamLoading } = useTeamMembers();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#03050d] text-white py-24 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#03050d]" />
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full mb-8 border border-indigo-500/25 bg-indigo-500/8 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Our Story</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Building India's Most<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Trusted B2B Marketplace
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Vendorkart was founded with a simple mission: make wholesale procurement transparent, efficient, and accessible to every business in India — from startups to enterprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#080c14] border-b border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-white/40 text-sm font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Our Mission</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight mb-5">
                Democratising B2B Trade Across India
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Before Vendorkart, finding verified wholesale suppliers meant cold calls, trade fairs, and endless spreadsheets. Small and medium businesses were at a disadvantage — unable to access the same supplier networks as large corporations.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We built Vendorkart to level the playing field. By digitising the entire procurement journey — from discovery to payment — we've enabled over 2.4 lakh businesses to source smarter, faster, and at better prices.
              </p>
              <div className="space-y-3">
                {[
                  "100% GST-verified vendor network",
                  "Escrow-protected bulk payments",
                  "Real-time order tracking nationwide",
                  "Dedicated account managers for scale",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {/* Timeline */}
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
                {milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    <p className="text-primary font-bold text-xs mb-0.5">{m.year}</p>
                    <p className="text-foreground text-sm leading-relaxed">{m.event}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 group hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-5`}>
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-3">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {(teamLoading || members.length > 0) && (
        <section className="py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">The People Behind Vendorkart</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">Meet Our Team</h2>
            </div>

            {teamLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="w-28 h-28 rounded-3xl bg-muted mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="text-center group"
                  >
                    <div className="relative inline-block mb-4">
                      <div className={`w-28 h-28 rounded-3xl overflow-hidden mx-auto shadow-lg transition-transform group-hover:scale-105 duration-300 ${member.imageUrl ? "" : `bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}`}`}>
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-3xl">
                            {getInitials(member.name)}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{member.position}</p>
                    {member.description && (
                      <p className="text-muted-foreground/70 text-xs mt-2 line-clamp-2 leading-relaxed">{member.description}</p>
                    )}
                    {(member.linkedinUrl || member.twitterUrl || member.githubUrl || member.instagramUrl) && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {member.linkedinUrl && (
                          <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.twitterUrl && (
                          <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:bg-sky-50 transition-colors">
                            <Twitter className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.githubUrl && (
                          <a href={member.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.instagramUrl && (
                          <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-pink-500 hover:bg-pink-50 transition-colors">
                            <Instagram className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Ready to Transform Your Procurement?</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Join 12,000+ verified vendors and 2.4 lakh buyers on India's leading B2B marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="h-13 px-8 rounded-xl font-bold">
              <Link href="/register?role=customer">Start Buying Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" asChild
              className="h-13 px-8 rounded-xl font-bold bg-white/15 border border-white/25 text-white hover:bg-white/20">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
