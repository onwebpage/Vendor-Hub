import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetPaymentHistory } from "@workspace/api-client-react";
import {
  CreditCard, CheckCircle2, XCircle, Clock, Download,
  Hash, Calendar, IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLES: Record<string, string> = {
  paid:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  refunded:"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};
const STATUS_ICON: Record<string, React.ElementType> = {
  paid: CheckCircle2, failed: XCircle, pending: Clock, refunded: CreditCard,
};

function handleDownloadStatement(payments: any[]) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const rows = payments.map(p =>
    `${new Date(p.createdAt || "").toLocaleDateString("en-IN").padEnd(14)}${p.transactionId?.padEnd(26) || "-".padEnd(26)}${p.status?.toUpperCase().padEnd(12)}${fmt(p.amount)}`
  ).join("\n");

  const total = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const content = [
    "=".repeat(66),
    "        VENDORKART — PAYMENT STATEMENT",
    "=".repeat(66),
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "-".repeat(66),
    `${"DATE".padEnd(14)}${"TRANSACTION ID".padEnd(26)}${"STATUS".padEnd(12)}AMOUNT`,
    "-".repeat(66),
    rows,
    "-".repeat(66),
    `TOTAL PAID: ${fmt(total)}`,
    "=".repeat(66),
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PaymentStatement-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PaymentHistory() {
  const { data: payments, isLoading } = useGetPaymentHistory();

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const list = payments || [];
  const totalPaid = (list as any[]).filter(p => p.status === "paid").reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-1">All your past transactions and payment records.</p>
        </div>
        {(list as any[]).length > 0 && (
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => handleDownloadStatement(list as any[])}>
            <Download className="w-4 h-4" />Download Statement
          </Button>
        )}
      </div>

      {/* Summary cards */}
      {!isLoading && (list as any[]).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Paid", value: fmt(totalPaid), icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Transactions", value: (list as any[]).length, icon: Hash, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Successful", value: (list as any[]).filter((p: any) => p.status === "paid").length, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-6 h-6 ${s.color}`} /></div>
              <div>
                <div className="text-2xl font-bold font-display">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (list as any[]).length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold mb-2">No payments yet</h3>
          <p className="text-muted-foreground">Your payment history will appear here once you complete an order.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-4 border-b border-border/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Date</span>
            <span className="col-span-2">Transaction ID</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-border/50">
            {(list as any[]).map((p: any) => {
              const StatusIcon = STATUS_ICON[p.status] || Clock;
              return (
                <div key={p.id} className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    {new Date(p.createdAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div className="sm:col-span-2 font-mono text-xs text-foreground truncate" title={p.transactionId}>
                    {p.transactionId || "—"}
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status] || STATUS_STYLES.pending}`}>
                      <StatusIcon className="w-3 h-3" />{p.status}
                    </span>
                  </div>
                  <div className="text-right font-bold text-sm">{fmt(p.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
