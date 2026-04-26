import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminStats, useListAllVendors, useApproveVendor, useRejectVendor } from "@workspace/api-client-react";
import { Users, Store, Package, IndianRupee, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();
  // Fetch pending vendors specifically for the quick approval widget
  const { data: vendorsData, refetch: refetchVendors } = useListAllVendors({ status: 'pending' });
  const { mutate: approveVendor } = useApproveVendor();
  const { mutate: rejectVendor } = useRejectVendor();
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    approveVendor({ id }, {
      onSuccess: () => {
        toast({ title: "Vendor Approved" });
        refetchVendors();
      }
    });
  };

  const handleReject = (id: number, businessName: string) => {
    const reason = window.prompt(`Reject ${businessName}? Optionally enter a reason:`, "");
    if (reason === null) return;
    rejectVendor(
      { id, data: { reason: reason || undefined } as any },
      {
        onSuccess: () => {
          toast({ title: "Vendor Rejected", variant: "destructive" });
          refetchVendors();
        },
        onError: () => toast({ title: "Failed to reject vendor", variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-64 w-full rounded-3xl" /></div></DashboardLayout>;

  const statCards = [
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Vendors", value: stats?.totalVendors || 0, icon: Store, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending Approvals", value: stats?.pendingVendors || 0, icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-display font-bold mb-8">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-4xl font-bold font-display tracking-tight">{stat.value}</div>
            <div className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Approval Queue */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            Vendor Approval Queue
            <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-800">{vendorsData?.vendors.length || 0}</Badge>
          </h2>
          
          <div className="space-y-4">
            {vendorsData?.vendors && vendorsData.vendors.length > 0 ? (
              vendorsData.vendors.slice(0, 5).map(vendor => (
                <div key={vendor.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-secondary/20">
                  <div>
                    <h3 className="font-bold">{vendor.businessName}</h3>
                    <p className="text-sm text-muted-foreground">{vendor.email} • {vendor.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleReject(vendor.id, vendor.businessName)}>
                      Reject
                    </Button>
                    <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(vendor.id)}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500/50" />
                <p>All caught up! No pending vendors.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Widget */}
        <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Recent Marketplace Orders</h2>
          <div className="space-y-4">
            {stats?.recentOrders?.slice(0,5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
                <div>
                  <div className="font-bold">#{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">{order.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{order.total.toLocaleString()}</div>
                  <Badge variant="outline" className="mt-1 text-[10px]">{order.status}</Badge>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No recent orders.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
