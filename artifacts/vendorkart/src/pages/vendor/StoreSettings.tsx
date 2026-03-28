import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetVendorProfile, useUpdateVendorProfile } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, Loader2, Save, AlertCircle, MapPin, Phone } from "lucide-react";
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
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  banner: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
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
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." className="rounded-xl" /></FormControl>
                  <FormDescription>Direct link to your logo image</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="banner" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." className="rounded-xl" /></FormControl>
                  <FormDescription>Direct link to your store banner</FormDescription>
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
