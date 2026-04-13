import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const APP_ORIGIN = import.meta.env.VITE_APP_ORIGIN as string | undefined;

if (!PUBLISHABLE_KEY) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY. Authentication will not work.");
}

const allowedRedirectOrigins = APP_ORIGIN ? [APP_ORIGIN] : [];

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY || ""}
    allowedRedirectOrigins={allowedRedirectOrigins}
    signInUrl="/login"
    signUpUrl="/register"
  >
    <App />
  </ClerkProvider>
);

