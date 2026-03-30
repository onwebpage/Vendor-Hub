import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe } from "@workspace/api-client-react";
import { User, Phone, Mail, Shield, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

export default function CustomerProfile() {
  const { data: me, isLoading, refetch } = useGetMe();
  const { toast } = useToast();
  const { setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me) {
      setName((me as any).name || "");
      setPhone((me as any).phone || "");
    }
  }, [me]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUser(updated);
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Profile updated successfully!" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (me as any)?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Card */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl mb-4">
            {initials}
          </div>
          <h3 className="font-bold text-xl">{(me as any)?.name}</h3>
          <p className="text-muted-foreground text-sm mt-1">{(me as any)?.email}</p>
          <div className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            {(me as any)?.role} Account
          </div>

          <div className="mt-6 w-full space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl bg-muted/40">
              <Mail className="w-4 h-4 text-primary" />
              <span className="truncate">{(me as any)?.email}</span>
            </div>
            {(me as any)?.phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl bg-muted/40">
                <Phone className="w-4 h-4 text-primary" />
                <span>{(me as any)?.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-green-500/10 text-green-600">
              <Shield className="w-4 h-4" />
              <span className="font-semibold">Account Verified</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />Personal Information
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={(me as any)?.email || ""}
                    disabled
                    className="h-12 rounded-xl bg-muted/40 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-12 rounded-xl font-semibold gap-2"
                >
                  {saved ? (
                    <><CheckCircle2 className="w-5 h-5" />Saved!</>
                  ) : (
                    <><Save className="w-5 h-5" />{isSaving ? "Saving..." : "Save Changes"}</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />Account Security
            </h2>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
              <div>
                <p className="font-semibold text-sm">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">Last updated: Unknown</p>
              </div>
              <Button variant="outline" className="rounded-xl text-xs h-9" onClick={() => alert("Password change flow — coming soon!")}>
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
