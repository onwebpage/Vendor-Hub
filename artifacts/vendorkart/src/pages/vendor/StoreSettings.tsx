import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetVendorProfile, useUpdateVendorProfile } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, Loader2, Save, AlertCircle, MapPin, Phone, Wallet, Lock, Link2, Copy, ExternalLink, Upload, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { motion } from "framer-motion";

const settingsSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  description: z.string().max(1000, "Max 1000 characters").optional(),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  banner: z.string().optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  upiId: z.string().optional(),
  upiQrImage: z.string().optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function StoreSettings() {
  const { toast } = useToast();
  const { data: profile, isLoading, isError } = useGetVendorProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateVendorProfile();
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const qrFileInputRef = React.useRef<HTMLInputElement>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerFileInputRef = React.useRef<HTMLInputElement>(null);

  const makeImageUploadHandler = (field: "upiQrImage" | "logo" | "banner") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        form.setValue(field, reader.result as string, { shouldDirty: true, shouldValidate: true });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

  const handleQrImageUpload = makeImageUploadHandler("upiQrImage");
  const handleLogoUpload = makeImageUploadHandler("logo");
  const handleBannerUpload = makeImageUploadHandler("banner");

  const canUploadBanner = (profile as any)?.subscriptionPlan === "standard" || (profile as any)?.subscriptionPlan === "premium";

  const slug = (profile as any)?.slug;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const storeUrl = slug ? `${window.location.origin}${base}/vendors/${slug}` : null;

  const handleCopyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      businessName: "",
      description: "",
      phone: "",
      email: "",
      logo: "",
      banner: "",
      gstNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        businessName: profile.businessName ?? "",
        description: profile.description ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        logo: profile.logo ?? "",
        banner: profile.banner ?? "",
        gstNumber: profile.gstNumber ?? "",
        address: profile.address ?? "",
        city: (profile as any).city ?? "",
        state: (profile as any).state ?? "",
        pincode: (profile as any).pincode ?? "",
        upiId: (profile as any).upiId ?? "",
        upiQrImage: (profile as any).upiQrImage ?? "",
      });
    }
  }, [profile]);

  async function onSubmit(values: SettingsFormValues) {
    try {
      await updateProfile({ data: values as any });
      toast({ title: "Store settings saved successfully" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <AlertCircle className="w-10 h-10 text-destructive/60" />
          <p>Failed to load store profile. Please refresh.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Store URL Banner */}
      {storeUrl && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">Your Public Store URL</p>
            <p className="text-sm font-mono text-primary truncate">{storeUrl}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1.5 h-8" onClick={handleCopyUrl}>
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy URL"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-xl gap-1.5 h-8" asChild>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" /> Visit Store
              </a>
            </Button>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-display">Store Settings</h2>
              <p className="text-muted-foreground text-sm mt-1">Update your store profile and business details</p>
            </div>
            <Button type="submit" disabled={isPending} className="gap-2 rounded-xl">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Save className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>

          <Section icon={Store} title="Store Identity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Business Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Your business name" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe your business, products, and specializations..." rows={4} className="rounded-xl resize-none" />
                  </FormControl>
                  <FormDescription>Max 1000 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="logo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Logo</FormLabel>
                  <div className="flex gap-2 items-start">
                    <FormControl>
                      <Input {...field} placeholder="https://... or upload an image" className="rounded-xl" />
                    </FormControl>
                    <input ref={logoFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <Button type="button" variant="outline" className="rounded-xl shrink-0 gap-2" onClick={() => logoFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                  </div>
                  {field.value && (
                    <div className="mt-2">
                      <img src={field.value} alt="Logo preview" className="w-14 h-14 rounded-xl object-cover border border-border/50" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <FormDescription>Your store logo — paste a URL or click Upload to choose a file</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="banner" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Store Banner
                    {!canUploadBanner && (
                      <span className="flex items-center gap-1 text-[11px] font-normal text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" /> Standard+ plan
                      </span>
                    )}
                  </FormLabel>
                  <div className="flex gap-2 items-start">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={canUploadBanner ? "https://... or upload an image" : "Upgrade to Standard or Premium to set a banner"}
                        className="rounded-xl"
                        disabled={!canUploadBanner}
                      />
                    </FormControl>
                    {canUploadBanner && (
                      <>
                        <input ref={bannerFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                        <Button type="button" variant="outline" className="rounded-xl shrink-0 gap-2" onClick={() => bannerFileInputRef.current?.click()}>
                          <Upload className="w-4 h-4" /> Upload
                        </Button>
                      </>
                    )}
                  </div>
                  {field.value && canUploadBanner && (
                    <div className="mt-2">
                      <img src={field.value} alt="Banner preview" className="w-full h-24 rounded-xl object-cover border border-border/50" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <FormDescription>
                    {canUploadBanner ? "Your store banner — paste a URL or click Upload to choose a file" : "Banner upload requires Standard or Premium subscription"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <Section icon={Phone} title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input {...field} placeholder="+91 98765 43210" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email</FormLabel>
                  <FormControl><Input {...field} placeholder="contact@yourbusiness.com" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gstNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl><Input {...field} placeholder="22AAAAA0000A1Z5" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <Section icon={MapPin} title="Business Address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl><Input {...field} placeholder="Street address, building, area" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input {...field} placeholder="Mumbai" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input {...field} placeholder="Maharashtra" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pincode</FormLabel>
                  <FormControl><Input {...field} placeholder="400001" className="rounded-xl" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <Section icon={Wallet} title="UPI Payment Setup">
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Add your UPI details so buyers can make direct payments to your store. This information will be visible on your store page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField control={form.control} name="upiId" render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl><Input {...field} placeholder="yourname@upi" className="rounded-xl" /></FormControl>
                  <FormDescription>Your registered UPI ID (e.g. vendor@okaxis)</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upiQrImage" render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI QR Code Image</FormLabel>
                  <div className="flex gap-2 items-start">
                    <FormControl>
                      <Input {...field} placeholder="https://... or upload an image" className="rounded-xl" />
                    </FormControl>
                    <input
                      ref={qrFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl shrink-0 gap-2"
                      onClick={() => qrFileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  {field.value && (
                    <div className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-white flex items-center justify-center shrink-0">
                        <img
                          src={field.value}
                          alt="QR Code preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <QrCode className="w-8 h-8 text-muted-foreground hidden" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">QR code set</p>
                        <p>Buyers will see this on your store page</p>
                      </div>
                    </div>
                  )}
                  <FormDescription>Upload a QR code image or paste a URL — buyers will scan this to pay you directly</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="gap-2 rounded-xl">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardLayout>
  );
}
