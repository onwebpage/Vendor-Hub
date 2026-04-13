import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useAuthStore } from "@/lib/auth-store";
import { setAuthTokenGetter } from "@workspace/api-client-react";


export function ClerkSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { isAuthenticated, login, logout } = useAuthStore();
  // Prevent concurrent sync attempts
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Register Clerk's getToken as the global auth token getter.
    // Every API call made via the generated API client will automatically
    // receive an Authorization: Bearer <token> header.
    setAuthTokenGetter(() => getToken());

    if (isSignedIn && !isAuthenticated && clerkUser && !isSyncing.current) {
      isSyncing.current = true;

      const syncWithBackend = async () => {
        try {
          const token = await getToken();
          if (!token) {
            isSyncing.current = false;
            return;
          }

          // First try to fetch existing user
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const userData = await res.json();
            login(userData, token);
            return;
          }

          // 404 = user exists in Clerk but not yet in our DB (first-time login)
          // 401 = token issue or stale session → try syncing anyway
          if (res.status === 404 || res.status === 401) {
            const role =
              (clerkUser.unsafeMetadata?.role as string) || "customer";
            const syncRes = await fetch("/api/auth/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ role }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              login(syncData.user, token);
            }
          }
        } catch (error) {
          console.error("ClerkSync: failed to sync auth state:", error);
        } finally {
          isSyncing.current = false;
        }
      };

      syncWithBackend();
    } else if (!isSignedIn && isAuthenticated) {
      // User signed out of Clerk → clear our local store too
      logout();
    }
  }, [isLoaded, isSignedIn, isAuthenticated, clerkUser]);

  return null;
}

