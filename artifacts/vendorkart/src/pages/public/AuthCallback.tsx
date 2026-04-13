import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth, useUser } from "@clerk/react";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2 } from "lucide-react";

function redirectForRole(role: string, setLocation: (to: string) => void) {
  if (role === "admin") setLocation("/admin");
  else if (role === "vendor") setLocation("/vendor-dashboard");
  else setLocation("/customer-dashboard");
}

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { getToken, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const storeUser = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const login = useAuthStore(s => s.login);

  // Prevent multiple sync attempts on re-renders
  const hasSynced = useRef(false);

  useEffect(() => {
    // Fast path: already have a session in the store — redirect immediately
    if (isAuthenticated && storeUser) {
      redirectForRole(storeUser.role, setLocation);
      return;
    }

    // Wait for Clerk to finish loading
    if (!isLoaded || !clerkUser) return;

    // Only sync once
    if (hasSynced.current) return;
    hasSynced.current = true;

    const role =
      new URLSearchParams(window.location.search).get("role") ||
      (clerkUser.unsafeMetadata?.role as string) ||
      "customer";

    async function sync() {
      try {
        const token = await getToken();
        if (!token) {
          hasSynced.current = false; // allow retry if token not ready yet
          return;
        }

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
          login(data.user, token);
          redirectForRole(data.user.role, setLocation);
        } else {
          console.error("Sync failed:", data);
          hasSynced.current = false;
          setLocation("/login");
        }
      } catch (err) {
        console.error("AuthCallback sync error:", err);
        hasSynced.current = false;
        setLocation("/login");
      }
    }

    sync();
    // Intentionally NOT including isAuthenticated/storeUser to avoid re-triggering
    // after the login() call updates Zustand — hasSynced.current guards that
  }, [isLoaded, clerkUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Setting up your account…</p>
    </div>
  );
}
