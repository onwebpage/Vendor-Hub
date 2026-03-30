import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe } from "@workspace/api-client-react";
import { User, Phone, Mail, Shield, Save, CheckCircle2, X, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const toggleShow = (k: "current" | "new" | "confirm") => setShow(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    if (form.newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast({ title: "Password changed successfully!" });
      onClose();
    } catch (err: any) {
      toast({ title: err.message || "Failed to change password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Change Password</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Keep your account secure</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(["current", "new", "confirm"] as const).map((field) => {
            const labels = { current: "Current Password", new: "New Password", confirm: "Confirm New Password" };
            const keys = { current: "currentPassword", new: "newPassword", confirm: "confirmPassword" };
            return (
              <div key={field} className="space-y-1.5">
                <Label>{labels[field]}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={show[field] ? "text" : "password"}
                    value={(form as any)[keys[field]]}
                    onChange={e => set(keys[field], e.target.value)}
                    placeholder="••••••••"
                    className="h-12 rounded-xl pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(field)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl h-11 gap-2">
              {saving ? "Saving..." : <><Shield className="w-4 h-4" />Update Password</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const { data: me, isLoading, refetch } = useGetMe();
  const { toast } = useToast();
  const { setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

          <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />Account Security
            </h2>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
              <div>
                <p className="font-semibold text-sm">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use a strong password to keep your account safe</p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl text-xs h-9 gap-2"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="w-3.5 h-3.5" />Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </DashboardLayout>
  );
}
