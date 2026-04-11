import { useEffect, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

interface LegalPageData {
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  updatedAt: string;
}

interface LegalPageProps {
  slug: string;
  icon: LucideIcon;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function LegalPage({ slug, icon: Icon }: LegalPageProps) {
  const [page, setPage] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/legal/${slug}`)
      .then((r) => r.json())
      .then((d) => { setPage(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="h-10 w-2/3 rounded-xl bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
            <div className="mt-12 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-1/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ) : !page ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">This page could not be found.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">{page.title}</h1>
            {page.subtitle && (
              <p className="text-muted-foreground mb-2">{page.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground mb-12">
              Last updated: {formatDate(page.updatedAt)}
            </p>

            <div
              className="legal-content prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </motion.div>
        )}
      </div>

      <style>{`
        .legal-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
        }
        .legal-content h2:first-child {
          margin-top: 0;
        }
        .legal-content p {
          color: hsl(var(--muted-foreground));
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          margin: 0.5rem 0 0.75rem 0;
          padding: 0;
          list-style: none;
        }
        .legal-content ul li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .legal-content ul li::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: hsl(var(--primary));
          flex-shrink: 0;
          margin-top: 0.55rem;
        }
        .legal-content strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
      `}</style>
    </PublicLayout>
  );
}
