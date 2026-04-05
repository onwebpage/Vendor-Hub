import { PublicLayout } from "@/components/layout/PublicLayout";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Platform Use",
    content: "Vendorkart is a multi-vendor marketplace that allows vendors to list and sell products to customers.",
  },
  {
    title: "2. User Accounts",
    items: [
      "Users must provide accurate information during registration.",
      "You are responsible for maintaining account confidentiality.",
    ],
  },
  {
    title: "3. Vendor Responsibility",
    items: [
      "Vendors are responsible for product quality, pricing, and delivery.",
      "Vendorkart is not responsible for product defects or disputes.",
    ],
  },
  {
    title: "4. Payments",
    items: [
      "All payments are processed through secure gateways.",
      "Vendorkart may charge commissions or subscription fees.",
    ],
  },
  {
    title: "5. Prohibited Activities",
    items: [
      "Fraudulent transactions",
      "Fake listings",
      "Violation of laws",
    ],
  },
  {
    title: "6. Limitation of Liability",
    content: "Vendorkart is not liable for any indirect or consequential damages.",
  },
  {
    title: "7. Changes to Terms",
    content: "We reserve the right to update these terms at any time.",
  },
  {
    title: "8. Contact",
    content: "For support, contact us via the website.",
  },
];

export default function Terms() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">Terms &amp; Conditions</h1>
        <p className="text-muted-foreground mb-2">Welcome to Vendorkart. By accessing or using our platform, you agree to comply with and be bound by the following terms.</p>
        <p className="text-xs text-muted-foreground mb-12">Last updated: January 2025</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-border/50 pb-10 last:border-0 last:pb-0">
              <h2 className="text-xl font-bold mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )}
              {section.items && (
                <ul className="space-y-2 mt-1">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
