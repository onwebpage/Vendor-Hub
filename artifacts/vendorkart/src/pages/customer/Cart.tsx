import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useCreateOrder, useListAddresses } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { useAuthStore } from "@/lib/auth-store";

function getWholesaleDiscount(subtotal: number): { percent: number; label: string } {
  if (subtotal >= 500000) return { percent: 12, label: "Bulk (₹5L+) — 12% off" };
  if (subtotal >= 200000) return { percent: 8, label: "Large (₹2L+) — 8% off" };
  if (subtotal >= 50000) return { percent: 5, label: "Wholesale (₹50K+) — 5% off" };
  if (subtotal >= 10000) return { percent: 2, label: "Volume (₹10K+) — 2% off" };
  return { percent: 0, label: "" };
}

function AddressSelector({ addresses, selectedId, onChange }: {
  addresses: any[];
  selectedId: number | null;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = addresses.find(a => a.id === selectedId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="font-semibold text-sm truncate">{selected.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {selected.addressLine1}, {selected.city}, {selected.state} — {selected.pincode}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a shipping address</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {addresses.map(addr => (
            <button
              key={addr.id}
              type="button"
              onClick={() => { onChange(addr.id); setOpen(false); }}
              className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedId === addr.id ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                {selectedId === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{addr.name}</p>
                  {addr.isDefault && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Default</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.addressLine1}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
            </button>
          ))}
          {addresses.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No addresses saved.{" "}
              <Link href="/customer-dashboard/addresses" className="text-primary hover:underline">Add one</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Cart() {
  const { data: cart, isLoading, refetch } = useGetCart();
  const { data: addresses } = useListAddresses();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { toast } = useToast();

  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const addrList: any[] = (addresses as any[]) || [];

  React.useEffect(() => {
    if (addrList.length > 0 && selectedAddressId === null) {
      const def = addrList.find(a => a.isDefault) || addrList[0];
      setSelectedAddressId(def.id);
    }
  }, [addrList]);

  const subtotal = cart?.subtotal || 0;
  const discount = useMemo(() => getWholesaleDiscount(subtotal), [subtotal]);
  const discountAmount = Math.round(subtotal * discount.percent / 100);
  const gst = Math.round((subtotal - discountAmount) * 0.18);
  const total = subtotal - discountAmount + gst;

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
    if (!selectedAddressId) {
      toast({ title: "Please select a shipping address", variant: "destructive" });
      return;
    }
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = async (txnId: string) => {
    try {
      setIsCreatingOrder(true);
      const order = await createOrder({ data: { shippingAddressId: selectedAddressId!, notes: `Paid via TXN: ${txnId}` } });
      if (order && (order as any).id) {
        const token = useAuthStore.getState().token;
        await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: (order as any).id, sessionId: txnId }),
        });
      }
      setPaymentOpen(false);
      toast({ title: "Order Placed Successfully!", description: "Check your orders page for tracking." });
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
                        {item.moq && item.moq > 1 && (
                          <div className="text-xs text-amber-600 mt-0.5">Min. order: {item.moq} units</div>
                        )}
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

          <div className="w-full lg:w-[400px]">
            <div className="bg-card rounded-3xl border border-border shadow-sm p-6 sticky top-28 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <AddressSelector
                  addresses={addrList}
                  selectedId={selectedAddressId}
                  onChange={setSelectedAddressId}
                />
                {addrList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <Link href="/customer-dashboard/addresses" className="hover:underline">Add a shipping address</Link> to proceed.
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discount.percent > 0 ? (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{discount.label}
                      </span>
                      <span className="font-semibold">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Wholesale Discount</span>
                      <span className="text-xs italic">Add ₹{(10000 - subtotal).toLocaleString()} more for 2% off</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="font-semibold">₹{gst.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                    <span className="font-bold text-lg text-foreground">Total Amount</span>
                    <span className="font-display font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {discount.percent === 0 && subtotal > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                    Reach ₹10,000 order value for wholesale discounts up to 12%!
                  </div>
                )}
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
                onClick={handleCheckoutClick}
                disabled={!selectedAddressId || addrList.length === 0}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure SSL encrypted payment. All prices include GST.
              </p>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => !isCreatingOrder && setPaymentOpen(false)}
        amount={total}
        onSuccess={handlePaymentSuccess}
      />
    </DashboardLayout>
  );
}
