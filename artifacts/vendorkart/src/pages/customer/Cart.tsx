import React, { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useCreateOrder, useListAddresses } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, ChevronDown, CheckCircle2, Upload, ExternalLink, QrCode, X, ImageIcon, Loader2, Tag, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

const PAYMENT_LINK = "https://razorpay.me/@debabratabanerjee3358";

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

function QRPaymentPanel({
  total,
  screenshot,
  onScreenshotChange,
  onConfirm,
  onBack,
  isLoading,
}: {
  total: number;
  screenshot: string | null;
  onScreenshotChange: (base64: string | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onScreenshotChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold">Pay via UPI / QR</h2>
          <p className="text-xs text-muted-foreground">Scan and pay ₹{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-muted/10 border border-blue-200 dark:border-blue-800/40">
        <img
          src="/qr-payment.jpg"
          alt="UPI QR Code — Debabrata Banerjee"
          className="w-52 h-auto rounded-xl shadow-md border border-white"
        />
        <p className="text-xs text-muted-foreground text-center">Scan with any UPI app · BHIM · GPay · PhonePe · Paytm</p>
        <a
          href={PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" /> Pay via Razorpay Link
        </a>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Upload Payment Screenshot</p>
        <p className="text-xs text-muted-foreground">After completing your payment, upload a screenshot as proof. Your order will be placed pending admin verification.</p>

        {screenshot ? (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img src={screenshot} alt="Payment screenshot" className="w-full max-h-48 object-contain bg-muted/20" />
            <button
              onClick={() => { onScreenshotChange(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border hover:bg-destructive/10 hover:border-destructive/40 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Screenshot uploaded
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
          >
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
            <span className="text-xs text-muted-foreground/60">PNG, JPG or WebP</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Button
        size="lg"
        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
        onClick={onConfirm}
        disabled={!screenshot || isLoading}
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Placing Order…</>
        ) : (
          <><CheckCircle2 className="w-5 h-5 mr-2" /> Confirm Order</>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Your order will be confirmed once admin verifies your payment screenshot.
      </p>
    </div>
  );
}

export default function Cart() {
  const { data: cart, isLoading, refetch } = useGetCart();
  const { data: addresses } = useListAddresses();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const { toast } = useToast();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

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
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const afterDiscounts = subtotal - discountAmount - couponDiscount;
  const gst = Math.round(afterDiscounts * 0.18);
  const total = afterDiscounts + gst;

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

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch(`/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount: subtotal - discountAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code, discount: data.discountAmount, label: data.label || code });
        setCouponInput("");
        toast({ title: "Coupon applied!", description: `You saved ₹${data.discountAmount.toLocaleString("en-IN")}` });
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  };

  const handleCheckoutClick = () => {
    if (!selectedAddressId) {
      toast({ title: "Please select a shipping address", variant: "destructive" });
      return;
    }
    setCheckoutOpen(true);
    setPaymentScreenshot(null);
  };

  const handleConfirmOrder = async () => {
    if (!paymentScreenshot) {
      toast({ title: "Please upload your payment screenshot", variant: "destructive" });
      return;
    }
    try {
      setIsCreatingOrder(true);
      await createOrder({
        data: {
          shippingAddressId: selectedAddressId!,
          paymentScreenshot,
          couponCode: appliedCoupon?.code ?? undefined,
          notes: "UPI QR payment — screenshot submitted for verification",
        } as any,
      });
      toast({ title: "Order Placed!", description: "Your order is pending payment verification by admin." });
      window.location.href = "/customer-dashboard/orders";
    } catch (error: any) {
      toast({ variant: "destructive", title: "Order failed", description: error.message });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-64 w-full rounded-3xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-display font-bold mb-6 sm:mb-8">Shopping Cart</h1>

      {!cart?.items || cart.items.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-8 sm:p-16 text-center shadow-sm">
          <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-5 sm:mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">Looks like you haven't added any wholesale products yet.</p>
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
              {checkoutOpen ? (
                <QRPaymentPanel
                  total={total}
                  screenshot={paymentScreenshot}
                  onScreenshotChange={setPaymentScreenshot}
                  onConfirm={handleConfirmOrder}
                  onBack={() => setCheckoutOpen(false)}
                  isLoading={isCreatingOrder}
                />
              ) : (
                <>
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

                  {/* Coupon Code Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" /> Have a Coupon?
                    </h2>
                    {appliedCoupon ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">Saving ₹{appliedCoupon.discount.toLocaleString("en-IN")}</p>
                        </div>
                        <button onClick={handleRemoveCoupon} className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                          <XCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                            onKeyDown={e => { if (e.key === "Enter") handleApplyCoupon(); }}
                            placeholder="Enter coupon code"
                            className="flex-1 h-10 px-3 rounded-xl text-sm border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleApplyCoupon}
                            disabled={!couponInput.trim() || couponLoading}
                            className="h-10 px-4 rounded-xl"
                          >
                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />{couponError}
                          </p>
                        )}
                      </div>
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

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />Coupon: {appliedCoupon.code}
                          </span>
                          <span className="font-semibold">-₹{couponDiscount.toLocaleString()}</span>
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

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                    <QrCode className="w-4 h-4 flex-shrink-0" />
                    Pay via UPI QR code. Upload your payment screenshot to confirm your order.
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25"
                    onClick={handleCheckoutClick}
                    disabled={!selectedAddressId || addrList.length === 0}
                  >
                    Proceed to Payment <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    UPI QR payment · Admin verified · Secure checkout
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
