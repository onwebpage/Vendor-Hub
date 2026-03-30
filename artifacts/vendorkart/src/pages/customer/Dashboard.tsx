import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe, useListOrders, useGetCart, useGetWishlist } from "@workspace/api-client-react";
import { Package, ShoppingBag, Clock, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const { data: user } = useGetMe();
  const { data: ordersData } = useListOrders({ limit: 5 });
  const { data: cart } = useGetCart();
  const { data: wishlist } = useGetWishlist();

  const stats = [
    { label: "Total Orders", value: ordersData?.total || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Deliveries", value: ordersData?.orders.filter(o => o.status === 'processing' || o.status === 'shipped').length || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Items in Cart", value: cart?.itemCount || 0, icon: ShoppingBag, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Saved Items", value: (wishlist as any[])?.length || 0, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your wholesale procurement.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button variant="ghost" asChild className="text-primary">
              <Link href="/customer-dashboard/orders">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
          
          {ordersData?.orders && ordersData.orders.length > 0 ? (
            <div className="space-y-4">
              {ordersData.orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:bg-secondary/30 transition-colors">
                  <div>
                    <div className="font-bold mb-1">#{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">{new Date(order.createdAt || '').toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{order.total.toLocaleString()}</div>
                    <div className={`text-xs font-semibold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No orders placed yet.</p>
              <Button className="mt-4 rounded-xl" asChild><Link href="/products">Start Sourcing</Link></Button>
            </div>
          )}
        </div>

        <div className="bg-primary text-primary-foreground rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553413077-190dd305871c?w=800')] mix-blend-overlay opacity-10 object-cover"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Need bulk custom quotes?</h3>
            <p className="text-primary-foreground/80 mb-6">Our procurement team can help you negotiate better rates with manufacturers for large volumes.</p>
            <Button variant="secondary" className="w-full rounded-xl font-bold">Request Custom Quote</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
