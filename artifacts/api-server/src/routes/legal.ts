import { Router } from "express";
import { db } from "@workspace/db";
import { legalPagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const pages = await db.select({
      slug: legalPagesTable.slug,
      title: legalPagesTable.title,
      subtitle: legalPagesTable.subtitle,
      updatedAt: legalPagesTable.updatedAt,
    }).from(legalPagesTable);
    return res.json(pages);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch legal pages" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const [page] = await db.select().from(legalPagesTable)
      .where(eq(legalPagesTable.slug, req.params.slug));
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch legal page" });
  }
});

export default router;
