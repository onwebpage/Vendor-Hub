import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListAddresses, useCreateAddress } from "@workspace/api-client-react";
import { MapPin, Plus, Trash2, Home, Building2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

function AddressForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { mutateAsync: createAddress } = useCreateAddress();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "", isDefault: false,
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createAddress({ data: { ...form, country: "India" } });
      toast({ title: "Address saved!" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Failed to save address", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Address</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Recipient name" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Mobile number" className="rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address Line 1 *</Label>
            <Input value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} placeholder="Street, building, floor" className="rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Address Line 2</Label>
            <Input value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} placeholder="Landmark, area (optional)" className="rounded-xl h-11" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>City *</Label>
              <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>State *</Label>
              <select value={form.state} onChange={e => set("state", e.target.value)} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Select</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Pincode *</Label>
              <Input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="6 digits" maxLength={6} className="rounded-xl h-11" />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium">Set as default address</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl h-11">{saving ? "Saving..." : "Save Address"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddressBook() {
  const { data: addresses, isLoading, refetch } = useListAddresses();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    const token = useAuthStore.getState().token;
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Address deleted" });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Address Book</h1>
          <p className="text-muted-foreground mt-1">Manage your shipping and billing addresses.</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : !addresses || (addresses as any[]).length === 0 ? (
        <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold mb-2">No addresses saved</h3>
          <p className="text-muted-foreground mb-6">Add a shipping address to place orders.</p>
          <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(addresses as any[]).map((addr: any) => (
            <div key={addr.id} className={`bg-card border rounded-2xl p-6 shadow-sm relative group transition-all ${addr.isDefault ? "border-primary shadow-primary/10" : "border-border/50"}`}>
              {addr.isDefault && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />Default
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-muted">
                  {addr.isDefault ? <Home className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-bold">{addr.name}</p>
                  {addr.phone && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 && <>, {addr.addressLine2}</>}
                <br />{addr.city}, {addr.state} — {addr.pincode}
                <br />{addr.country || "India"}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive hover:text-white gap-1"
                  onClick={() => handleDelete(addr.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <AddressForm onClose={() => setShowForm(false)} onSaved={refetch} />}
    </DashboardLayout>
  );
}
