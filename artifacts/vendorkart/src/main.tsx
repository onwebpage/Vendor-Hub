import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY. Authentication will not work.");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY || ""}>
    <App />
  </ClerkProvider>
);

