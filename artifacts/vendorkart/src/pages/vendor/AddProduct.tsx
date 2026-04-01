import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct, useListCategories, useGetVendorProfile, useGetCurrentSubscription } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ImagePlus, Lock, Clock, AlertCircle, Images, Upload } from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(3, "Product name required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  comparePrice: z.coerce.number().optional(),
  moq: z.coerce.number().min(1, "Minimum order quantity required"),
  unit: z.string().min(1, "Unit required (e.g., pieces, kg)"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  shortDescription: z.string().max(200, "Keep it under 200 characters").optional(),
  description: z.string().optional(),
  imageUrls: z.array(z.object({ url: z.string() })).optional(),
  bulkPricing: z.array(z.object({
    minQty: z.coerce.number(),
    price: z.coerce.number()
  })).optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchMyProductCount() {
  const token = localStorage.getItem("vendorkart_token");
  const res = await fetch(`${API}/api/vendors/my-products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: categories } = useListCategories();
  const { data: vendorProfile, isLoading: profileLoading, isError: profileError } = useGetVendorProfile();
  const { data: currentSub } = useGetCurrentSubscription({ query: { retry: false } });
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  const [productCount, setProductCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    fetchMyProductCount().then(setProductCount);
  }, []);

  const maxProducts: number = (currentSub as any)?.plan?.maxProducts ?? 50;
  const maxImages: number = (currentSub as any)?.plan?.maxImages ?? 5;
  const isAtLimit = maxProducts !== -1 && productCount !== null && productCount >= maxProducts;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", price: 0, moq: 1, unit: "pieces", stock: 100,
      imageUrls: [{ url: "" }, { url: "" }, { url: "" }],
      bulkPricing: [{ minQty: 10, price: 0 }]
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    name: "imageUrls",
    control: form.control
  });

  const imageFileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleImageFileUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue(`imageUrls.${index}.url`, reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const { fields, append, remove } = useFieldArray({
    name: "bulkPricing",
    control: form.control
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const images = (data.imageUrls || []).map(i => i.url).filter(u => u && u.trim().length > 0);
      const apiData = {
        ...data,
        images,
        bulkPricing: data.bulkPricing?.filter(b => b.minQty > 0 && b.price > 0)
      };
      
      await createProduct({ data: apiData as any });
      toast({ title: "Success", description: "Product added successfully." });
      setLocation("/vendor-dashboard/products");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add product" });
    }
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (profileError || !vendorProfile) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-muted border border-border mb-6">
            <Lock className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Unable to load vendor profile</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Please log in again and try accessing this page.
          </p>
          <Button variant="outline" onClick={() => setLocation("/vendor-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (vendorProfile.status === "pending") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Approval Pending</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your vendor account is still under review by the admin. You will be able to add products once your account is approved.
          </p>
          <Button variant="outline" onClick={() => setLocation("/vendor-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (vendorProfile.status === "rejected" || vendorProfile.status === "suspended") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-red-500/10 border border-red-500/20 mb-6">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {vendorProfile.status === "suspended" ? "Account Suspended" : "Account Not Approved"}
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {vendorProfile.rejectionReason || "Your vendor account is not active. Please contact support for assistance."}
          </p>
          <Button variant="outline" onClick={() => setLocation("/vendor-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (vendorProfile.status !== "approved") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-muted border border-border mb-6">
            <Lock className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Access Restricted</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            You must be an approved vendor to add products.
          </p>
          <Button variant="outline" onClick={() => setLocation("/vendor-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isAtLimit) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="inline-flex p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertCircle className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Product Limit Reached</h2>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Your current plan allows up to <strong>{maxProducts} products</strong>. You have {productCount} products listed.
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Upgrade to a higher subscription plan to list more products.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation("/vendor-dashboard/products")}>
              View Products
            </Button>
            <Button onClick={() => setLocation("/vendor-dashboard/subscription")}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-6 md:mb-8">Add New Product</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            
            {/* Basic Info */}
            <div className="bg-card p-5 sm:p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-5 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold border-b border-border/50 pb-3 md:pb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Product Title *</FormLabel>
                    <FormControl><Input placeholder="E.g. Industrial Grade Steel Pipes" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU Code</FormLabel>
                    <FormControl><Input placeholder="Item-123" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="shortDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl><Textarea placeholder="Brief summary for product card..." className="rounded-xl resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Multi-image upload section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FormLabel className="mb-0">Product Images</FormLabel>
                    <Badge variant="outline" className="text-xs font-normal">
                      {imageFields.length} / {maxImages} images
                    </Badge>
                  </div>
                  {imageFields.length < maxImages && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => appendImage({ url: "" })}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Add Image
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5" />
                  Your plan allows up to {maxImages} image{maxImages !== 1 ? "s" : ""} per product. Paste URLs or click Upload.
                </p>
                <div className="space-y-3">
                  {imageFields.map((imgField, index) => (
                    <FormField
                      key={imgField.id}
                      control={form.control}
                      name={`imageUrls.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-3 items-center">
                              <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50 shrink-0 overflow-hidden">
                                {field.value ? (
                                  <img src={field.value} alt="" className="w-full h-full object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                ) : (
                                  <ImagePlus className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <Input
                                placeholder={`Image ${index + 1} — paste URL or click Upload`}
                                className="h-11 rounded-xl flex-1"
                                {...field}
                              />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={el => { imageFileInputRefs.current[index] = el; }}
                                onChange={handleImageFileUpload(index)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl shrink-0"
                                title="Upload image"
                                onClick={() => imageFileInputRefs.current[index]?.click()}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              {imageFields.length > 3 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 text-destructive hover:bg-destructive/10 shrink-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                {imageFields.length >= maxImages && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Image limit reached for your plan. Upgrade to add more images.
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card p-5 sm:p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-5">
              <h2 className="text-lg md:text-xl font-bold border-b border-border/50 pb-3 md:pb-4">Full Description</h2>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Product Description</FormLabel>
                  <FormControl><Textarea placeholder="Include specifications, materials, certifications, use cases..." className="rounded-xl resize-none min-h-[120px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-card p-5 sm:p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-5 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold border-b border-border/50 pb-3 md:pb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (₹) *</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comparePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>MRP (Optional)</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure *</FormLabel>
                    <FormControl><Input placeholder="pcs, kg, tons..." className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="moq" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Order Quantity (MOQ) *</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Stock *</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Bulk Pricing Section */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Bulk Pricing Tiers</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ minQty: 0, price: 0 })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Tier
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end bg-secondary/30 p-4 rounded-xl border border-border/50">
                      <FormField control={form.control} name={`bulkPricing.${index}.minQty`} render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Min Quantity</FormLabel>
                          <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`bulkPricing.${index}.price`} render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Price per unit (₹)</FormLabel>
                          <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && <p className="text-sm text-muted-foreground">No volume discounts added.</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button type="button" variant="ghost" className="h-11 sm:h-12 px-5 sm:px-6 order-2 sm:order-1" onClick={() => setLocation("/vendor-dashboard/products")}>Cancel</Button>
              <Button type="submit" className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/25 order-1 sm:order-2" disabled={isPending}>
                {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Save Product
              </Button>
            </div>
            
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
