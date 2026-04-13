import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth-store";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") setLocation("/admin");
      else if (user.role === "vendor") setLocation("/vendor-dashboard");
      else setLocation("/customer-dashboard");
    } else {
      setLocation("/login");
    }
  }, []);

  return null;
}
