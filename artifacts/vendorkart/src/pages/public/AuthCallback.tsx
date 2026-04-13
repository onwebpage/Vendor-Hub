import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, useUser } from "@clerk/react";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const login = useAuthStore(s => s.login);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    const role = (new URLSearchParams(window.location.search).get("role")) ||
      (clerkUser.unsafeMetadata?.role as string) || "customer";

    async function sync() {
      try {
        const token = await getToken();
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          login(data.user, token!);
          if (data.user.role === "admin") setLocation("/admin");
          else if (data.user.role === "vendor") setLocation("/vendor-dashboard");
          else setLocation("/customer-dashboard");
        }
      } catch {
        setLocation("/login");
      }
    }

    sync();
  }, [isLoaded, clerkUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
