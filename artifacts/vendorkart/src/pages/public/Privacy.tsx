import { PublicLayout } from "@/components/layout/PublicLayout";
import { Lock } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    items: [
      "Name, email, phone number",
      "Address and payment details",
      "Vendor business information",
    ],
  },
  {
    title: "2. How We Use Data",
    items: [
      "To process orders and payments",
      "To improve user experience",
      "To communicate updates and offers",
    ],
  },
  {
    title: "3. Data Sharing",
    content: "We do not sell your data. Data may be shared with:",
    items: [
      "Payment gateways",
      "Delivery partners",
    ],
  },
  {
    title: "4. Data Security",
    content: "We use secure servers and encryption to protect your data.",
  },
  {
    title: "5. Cookies",
    content: "We use cookies to improve website functionality.",
  },
  {
    title: "6. User Rights",
    content: "Users can request access or deletion of their data.",
  },
  {
    title: "7. Updates",
    content: "This policy may be updated periodically.",
  },
];

export default function Privacy() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-2">Vendorkart respects your privacy and is committed to protecting your data.</p>
        <p className="text-xs text-muted-foreground mb-12">Last updated: January 2025</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-border/50 pb-10 last:border-0 last:pb-0">
              <h2 className="text-xl font-bold mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-muted-foreground leading-relaxed mb-3">{section.content}</p>
              )}
              {section.items && (
                <ul className="space-y-2">
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
