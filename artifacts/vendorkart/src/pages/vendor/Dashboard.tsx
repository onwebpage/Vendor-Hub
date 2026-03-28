import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetVendorProfile } from "@workspace/api-client-react";
import { Store, Package, ShoppingBag, IndianRupee, TrendingUp, Clock, CheckCircle2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorDashboard() {
  const { data: profile, isLoading } = useGetVendorProfile();

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-64 w-full rounded-3xl" /></div></DashboardLayout>;

  const isPending = profile?.status === "pending";
  const isRejected = profile?.status === "rejected";

  const stats = [
    { label: "Total Revenue", value: `₹${(profile?.totalSales || 0).toLocaleString()}`, icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Products", value: profile?.productCount || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Orders", value: 0, icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Store Rating", value: `${profile?.rating?.toFixed(1) || "N/A"} / 5`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Vendor Hub</h1>
          <p className="text-muted-foreground mt-1">Manage your store, products, and incoming orders.</p>
        </div>
        {isPending || isRejected ? (
          <Button disabled className="rounded-xl h-12 px-6 opacity-50 cursor-not-allowed">
            <Lock className="w-4 h-4 mr-2" /> Add New Product
          </Button>
        ) : (
          <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20" asChild>
            <Link href="/vendor-dashboard/add-product"><Plus className="w-5 h-5 mr-2" /> Add New Product</Link>
          </Button>
        )}
      </div>

      {isPending && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/8 p-6 mb-8 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/15 flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-amber-700 dark:text-amber-400">Awaiting Admin Approval</h3>
            <p className="mt-1 text-amber-700/80 dark:text-amber-400/80 text-sm leading-relaxed">
              Your vendor account is under review. The admin will verify your business details before activating your store.
              <br />
              <span className="font-semibold">Until approved: </span>You cannot add products and your store will not appear in the vendor listing.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/8 p-6 mb-8 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-500/15 flex-shrink-0">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-red-700 dark:text-red-400">Account Not Approved</h3>
            <p className="mt-1 text-red-700/80 dark:text-red-400/80 text-sm">
              {profile?.rejectionReason || "Your vendor application was not approved. Please contact support for more information."}
            </p>
          </div>
        </div>
      )}

      {/* Store Profile Card */}
      <div className="bg-card rounded-3xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="h-32 bg-secondary relative">
          {profile?.banner && <img src={profile.banner} alt="Banner" className="w-full h-full object-cover" />}
        </div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 rounded-2xl border-4 border-card bg-white overflow-hidden -mt-12 mb-4 shadow-sm flex items-center justify-center">
            {profile?.logo ? <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-muted-foreground" />}
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold">{profile?.businessName}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                {profile?.city}, {profile?.state} • 
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase">{profile?.subscriptionPlan} Plan</span>
              </p>
            </div>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/vendor-dashboard/store-settings">Edit Store</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-3xl font-bold font-display">{stat.value}</div>
            <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions / Recent activity would go here */}
    </DashboardLayout>
  );
}
