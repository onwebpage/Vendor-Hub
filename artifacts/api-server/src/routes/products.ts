import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, vendorsTable, categoriesTable } from "@workspace/db/schema";
import { eq, and, ilike, gte, lte, sql, count } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { uniqueSlug } from "../lib/slugify.js";

const router = Router();

async function enrichProduct(p: any) {
  const [vendor] = await db.select({ businessName: vendorsTable.businessName, slug: vendorsTable.slug })
    .from(vendorsTable).where(eq(vendorsTable.id, p.vendorId));
  const [cat] = await db.select({ name: categoriesTable.name })
    .from(categoriesTable).where(eq(categoriesTable.id, p.categoryId));
  return {
    ...p,
    vendorName: vendor?.businessName,
    vendorSlug: vendor?.slug,
    categoryName: cat?.name,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    rating: p.rating ? Number(p.rating) : 0,
  };
}

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 16;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const vendorId = req.query.vendorId ? Number(req.query.vendorId) : null;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const conditions = [eq(productsTable.status, "approved")];
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (vendorId) conditions.push(eq(productsTable.vendorId, vendorId));
    if (minPrice !== null) conditions.push(gte(productsTable.price, String(minPrice)));
    if (maxPrice !== null) conditions.push(lte(productsTable.price, String(maxPrice)));

    const products = await db.select().from(productsTable)
      .where(and(...conditions))
      .orderBy(sql`${productsTable.createdAt} DESC`)
      .limit(limit).offset(offset);

    const [{ value: total }] = await db.select({ value: count() }).from(productsTable)
      .where(and(...conditions));

    const enriched = await Promise.all(products.map(enrichProduct));
    return res.json({ products: enriched, total: Number(total), page, totalPages: Math.ceil(Number(total) / limit) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [product] = await db.select().from(productsTable)
      .where(eq(productsTable.id, Number(req.params.id)));
    if (!product) return res.status(404).json({ message: "Product not found" });

    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, product.vendorId));
    const enriched = await enrichProduct(product);

    const related = await db.select().from(productsTable)
      .where(and(eq(productsTable.categoryId, product.categoryId), eq(productsTable.status, "approved")))
      .limit(6);
    const enrichedRelated = await Promise.all(related.map(enrichProduct));

    return res.json({ product: enriched, vendor, relatedProducts: enrichedRelated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get product" });
  }
});

router.post("/", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });

    const { categoryId, name, description, shortDescription, images, price, comparePrice, moq, unit, stock, sku, bulkPricing } = req.body;
    const slug = uniqueSlug(name);
    const [product] = await db.insert(productsTable).values({
      vendorId: vendor.id,
      categoryId: Number(categoryId),
      name, slug, description, shortDescription,
      images: images || [],
      price: String(price),
      comparePrice: comparePrice ? String(comparePrice) : null,
      moq: moq || 1,
      unit: unit || "piece",
      stock: stock || 0,
      sku,
      bulkPricing: bulkPricing || [],
      status: "pending",
    }).returning();

    await db.update(vendorsTable)
      .set({ productCount: vendor.productCount + 1, updatedAt: new Date() })
      .where(eq(vendorsTable.id, vendor.id));

    return res.status(201).json({ ...product, price: Number(product.price) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/:id", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const [existing] = await db.select().from(productsTable)
      .where(and(eq(productsTable.id, Number(req.params.id)), eq(productsTable.vendorId, vendor.id)));
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const { categoryId, name, description, shortDescription, images, price, comparePrice, moq, unit, stock, sku, bulkPricing } = req.body;
    const [product] = await db.update(productsTable)
      .set({
        categoryId: categoryId ? Number(categoryId) : existing.categoryId,
        name: name || existing.name,
        description, shortDescription,
        images: images || existing.images,
        price: price ? String(price) : existing.price,
        comparePrice: comparePrice ? String(comparePrice) : existing.comparePrice,
        moq: moq || existing.moq,
        unit: unit || existing.unit,
        stock: stock !== undefined ? stock : existing.stock,
        sku: sku || existing.sku,
        bulkPricing: bulkPricing || existing.bulkPricing,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, Number(req.params.id)))
      .returning();
    return res.json({ ...product, price: Number(product.price) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/:id", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
