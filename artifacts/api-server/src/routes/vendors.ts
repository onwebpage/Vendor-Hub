import { Router } from "express";
import { db } from "@workspace/db";
import { vendorsTable, usersTable, productsTable, reviewsTable } from "@workspace/db/schema";
import { eq, and, ilike, count, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let query = db.select().from(vendorsTable).where(eq(vendorsTable.status, "approved"));
    if (search) {
      query = db.select().from(vendorsTable).where(
        and(eq(vendorsTable.status, "approved"), ilike(vendorsTable.businessName, `%${search}%`))
      );
    }

    const vendors = await query.limit(limit).offset(offset);
    const [{ value: total }] = await db.select({ value: count() }).from(vendorsTable)
      .where(eq(vendorsTable.status, "approved"));

    return res.json({ vendors, total: Number(total), page, totalPages: Math.ceil(Number(total) / limit) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendors" });
  }
});

router.get("/profile", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor profile not found" });
    return res.json(vendor);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get vendor profile" });
  }
});

router.put("/profile", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [existing] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!existing) return res.status(404).json({ message: "Vendor profile not found" });

    const { businessName, description, logo, banner, phone, address, city, state, pincode, gstNumber, upiId, upiQrImage } = req.body;
    const [vendor] = await db.update(vendorsTable)
      .set({ businessName, description, logo, banner, phone, address, city, state, pincode, gstNumber, upiId, upiQrImage, updatedAt: new Date() })
      .where(eq(vendorsTable.userId, userId))
      .returning();
    return res.json(vendor);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update vendor profile" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const [vendor] = await db.select().from(vendorsTable)
      .where(eq(vendorsTable.slug, req.params.slug));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (vendor.status !== "approved") return res.status(403).json({ message: "This store is not available" });

    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.vendorId, vendor.id), eq(productsTable.status, "approved")))
      .limit(20);

    const reviews = await db.select({
      id: reviewsTable.id,
      vendorId: reviewsTable.vendorId,
      customerId: reviewsTable.customerId,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      customerName: usersTable.name,
      customerAvatar: usersTable.avatar,
    }).from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.customerId, usersTable.id))
      .where(eq(reviewsTable.vendorId, vendor.id))
      .orderBy(sql`${reviewsTable.createdAt} DESC`)
      .limit(10);

    return res.json({ vendor, products, reviews, categories: [] });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get vendor store" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [vendor] = await db.select().from(vendorsTable)
      .where(eq(vendorsTable.id, Number(req.params.id)));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    return res.json(vendor);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get vendor" });
  }
});

export default router;
