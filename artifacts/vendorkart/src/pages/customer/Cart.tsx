import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useCreateOrder } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "@/components/shared/PaymentModal";

export default function Cart() {
  const { data: cart, isLoading, refetch } = useGetCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { toast } = useToast();
  
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleUpdateQuantity = (itemId: number, newQty: number) => {
    updateItem(
      { itemId, data: { quantity: newQty } },
      { onSuccess: () => refetch() }
    );
  };

  const handleRemove = (itemId: number) => {
    removeItem(
      { itemId },
      { 
        onSuccess: () => {
          toast({ title: "Item removed" });
          refetch();
        } 
      }
    );
  };

  const handleCheckoutClick = () => {
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = async (txnId: string) => {
    try {
      setIsCreatingOrder(true);
      // Dummy address ID for now, real app would have address selector
      await createOrder({ data: { shippingAddressId: 1, notes: `Paid via TXN: ${txnId}` } });
      setPaymentOpen(false);
      toast({ title: "Order Placed Successfully!", description: "Check your orders page for tracking." });
      // Redirect to orders or clear cart
      window.location.href = "/customer-dashboard/orders";
    } catch (error: any) {
      toast({ variant: "destructive", title: "Order failed", description: error.message });
      setPaymentOpen(false);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-64 w-full rounded-3xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

      {!cart?.items || cart.items.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-16 text-center shadow-sm">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any wholesale products yet.</p>
          <Button size="lg" className="rounded-xl px-8" asChild>
            <Link href="/products">Browse Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-6 border-b border-border/50 text-sm font-semibold text-muted-foreground uppercase tracking-wider hidden sm:grid">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="divide-y divide-border/50">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl border border-border bg-white p-2 shrink-0">
                        <img src={item.productImage || "https://via.placeholder.com/150"} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground line-clamp-1">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Sold by {item.vendorName}</p>
                        <div className="text-sm font-bold mt-1 text-primary">₹{item.price.toLocaleString()} / unit</div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                      <div className="flex items-center border border-border rounded-lg bg-background h-10">
                        <button 
                          className="px-3 h-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                          onClick={() => handleUpdateQuantity(item.id, Math.max((item.moq || 1), item.quantity - 1))}
                          disabled={item.quantity <= (item.moq || 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-sm">{item.quantity}</span>
                        <button 
                          className="px-3 h-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-bold text-lg">
                      ₹{(item.subtotal || (item.price * item.quantity)).toLocaleString()}
                    </div>
                    
                    <div className="col-span-1 text-right">
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-semibold">₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (18% GST)</span>
                  <span className="font-semibold">₹{(cart.subtotal * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Wholesale Discount</span>
                  <span>-₹0</span>
                </div>
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">Total Amount</span>
                  <span className="font-display font-bold text-2xl text-primary">₹{(cart.subtotal * 1.18).toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
                onClick={handleCheckoutClick}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Secure SSL encrypted payment. Shipping calculated at next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => !isCreatingOrder && setPaymentOpen(false)}
        amount={cart ? cart.subtotal * 1.18 : 0}
        onSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
}
