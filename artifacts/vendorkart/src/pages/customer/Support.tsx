import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListTickets, useCreateTicket } from "@workspace/api-client-react";
import {
  LifeBuoy, Plus, X, Clock, CheckCircle2, AlertCircle,
  MessageSquare, ChevronRight, Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:     { label: "Open",       color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       icon: Clock },
  pending:  { label: "Pending",    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   icon: Clock },
  resolved: { label: "Resolved",   color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",   icon: CheckCircle2 },
  closed:   { label: "Closed",     color: "bg-muted text-muted-foreground",                                         icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = {
  low:      "text-slate-500",
  medium:   "text-amber-600",
  high:     "text-red-600",
  urgent:   "text-red-700 font-bold",
};

const SUPPORT_TYPES = [
  "Order Issue", "Payment Problem", "Product Quality", "Delivery Delay",
  "Return / Refund", "Account Access", "Vendor Complaint", "Other",
];

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { mutateAsync: createTicket } = useCreateTicket();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", type: "" });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast({ title: "Please fill subject and description", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createTicket({ data: { subject: form.subject, description: form.description, priority: form.priority } });
      toast({ title: "Support ticket created!", description: "Our team will respond within 24 hours." });
      onCreated();
      onClose();
    } catch {
      toast({ title: "Failed to create ticket", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">New Support Ticket</h2>
            <p className="text-sm text-muted-foreground mt-0.5">We'll get back to you within 24 hours</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Issue Type</Label>
            <div className="flex flex-wrap gap-2">
              {SUPPORT_TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => set("subject", t)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${form.subject === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Brief description of your issue" className="rounded-xl h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Description *</Label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe your issue in detail — include order numbers, dates, or screenshots if relevant..."
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {["low", "medium", "high", "urgent"].map(p => (
                <button
                  key={p} type="button"
                  onClick={() => set("priority", p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border capitalize transition-all ${form.priority === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl h-11 gap-2">
              {saving ? "Submitting..." : <><Plus className="w-4 h-4" />Submit Ticket</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function CustomerSupport() {
  const { data: tickets, isLoading, refetch } = useListTickets();
  const [showForm, setShowForm] = useState(false);

  const list: any[] = tickets || [];
  const openCount = list.filter(t => t.status === "open" || t.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Support & Tickets</h1>
          <p className="text-muted-foreground mt-1">
            {openCount > 0 ? `${openCount} open ticket${openCount !== 1 ? "s" : ""}` : "Raise a ticket if you need help."}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />New Ticket
        </Button>
      </div>

      {/* Quick help cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: MessageSquare, title: "Live Chat", desc: "Chat with our support team", action: "Start Chat" },
          { icon: LifeBuoy, title: "Help Centre", desc: "Browse FAQs and guides", action: "Visit Help" },
          { icon: AlertCircle, title: "Report Issue", desc: "Flag urgent problems", action: "Report" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group">
            <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-3">
              <c.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm">{c.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-3">{c.desc}</p>
            <div className="flex items-center text-xs text-primary font-semibold group-hover:gap-2 transition-all gap-1">
              {c.action}<ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold mb-2">No support tickets</h3>
          <p className="text-muted-foreground mb-6">Raise a ticket whenever you need help with an order or account.</p>
          <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />Create Your First Ticket
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Subject</span>
            <span className="col-span-2">Priority</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Created</span>
          </div>
          <div className="divide-y divide-border/50">
            {list.map((t: any) => {
              const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
              const Icon = cfg.icon;
              return (
                <div key={t.id} className="grid grid-cols-2 sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                  <div className="sm:col-span-5">
                    <p className="font-semibold text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className={`text-xs font-bold capitalize ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium}`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </div>
                  <div className="sm:col-span-3 text-xs text-muted-foreground">
                    {t.createdAt ? timeAgo(t.createdAt) : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && <NewTicketModal onClose={() => setShowForm(false)} onCreated={refetch} />}
    </DashboardLayout>
  );
}
