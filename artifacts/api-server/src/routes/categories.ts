import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { slugify } from "../lib/slugify.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const result = await Promise.all(cats.map(async (cat) => {
      const [{ value }] = await db.select({ value: count() }).from(productsTable)
        .where(eq(productsTable.categoryId, cat.id));
      return { ...cat, productCount: Number(value) };
    }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [cat] = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.id, Number(req.params.id)));
    if (!cat) return res.status(404).json({ message: "Category not found" });
    return res.json(cat);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get category" });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, icon, image, parentId } = req.body;
    const slug = slugify(name);
    const [cat] = await db.insert(categoriesTable).values({
      name, slug, description, icon, image, parentId,
    }).returning();
    return res.status(201).json(cat);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, icon, image, parentId } = req.body;
    const [cat] = await db.update(categoriesTable)
      .set({ name, description, icon, image, parentId })
      .where(eq(categoriesTable.id, Number(req.params.id)))
      .returning();
    return res.json(cat);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update category" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, Number(req.params.id)));
    return res.json({ message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;
