import { Router } from "express";
import { db } from "@workspace/db";
import { vendorsTable, usersTable, productsTable, reviewsTable, ordersTable } from "@workspace/db/schema";
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

router.get("/my-products", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const products = await db.select().from(productsTable)
      .where(eq(productsTable.vendorId, vendor.id))
      .orderBy(sql`${productsTable.createdAt} DESC`);
    return res.json(products.map(p => ({ ...p, price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendor products" });
  }
});

router.get("/my-orders", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const allOrders = await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`).limit(100);
    const vendorOrders = allOrders.filter((order: any) =>
      Array.isArray(order.items) && order.items.some((item: any) => item.vendorId === vendor.id)
    ).map((order: any) => ({
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      vendorItems: order.items.filter((item: any) => item.vendorId === vendor.id),
    }));
    return res.json(vendorOrders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendor orders" });
  }
});

router.get("/analytics", authenticate, requireRole("vendor"), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.userId, userId));
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const allOrders = await db.select().from(ordersTable)
      .orderBy(sql`${ordersTable.createdAt} DESC`).limit(500);

    const vendorOrders = allOrders.filter((order: any) =>
      Array.isArray(order.items) && order.items.some((item: any) => item.vendorId === vendor.id)
    );

    let totalRevenue = 0;
    let pendingCount = 0;
    const productMap: Record<string, { name: string; quantity: number; revenue: number; image?: string }> = {};
    const dailyMap: Record<string, number> = {};
    const monthlyMap: Record<string, number> = {};
    const now = new Date();

    vendorOrders.forEach((order: any) => {
      const vendorItems = (order.items as any[]).filter((item: any) => item.vendorId === vendor.id);
      const orderRevenue = vendorItems.reduce((sum: number, item: any) => sum + Number(item.subtotal || 0), 0);
      totalRevenue += orderRevenue;

      const isPending = ["pending_payment", "pending", "confirmed", "processing"].includes(order.status);
      if (isPending) pendingCount++;

      vendorItems.forEach((item: any) => {
        const key = String(item.productId);
        if (!productMap[key]) productMap[key] = { name: item.productName, quantity: 0, revenue: 0, image: item.productImage };
        productMap[key].quantity += Number(item.quantity);
        productMap[key].revenue += Number(item.subtotal || 0);
      });

      const date = new Date(order.createdAt);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        const dayKey = date.toISOString().split("T")[0];
        dailyMap[dayKey] = (dailyMap[dayKey] || 0) + orderRevenue;
      }
      const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diffMonths <= 12) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + orderRevenue;
      }
    });

    const commissionRate = 0.15;
    const vendorEarnings = totalRevenue * (1 - commissionRate);

    const topProducts = Object.entries(productMap)
      .map(([id, data]) => ({ productId: Number(id), ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return { date: key, label, revenue: dailyMap[key] || 0 };
    });

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      return { month: key, label, revenue: monthlyMap[key] || 0 };
    });

    return res.json({
      totalRevenue,
      vendorEarnings,
      pendingOrders: pendingCount,
      totalOrders: vendorOrders.length,
      topProducts,
      dailyRevenue,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("analytics error", err);
    return res.status(500).json({ message: "Failed to get analytics" });
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

    const { businessName, description, logo, banner, phone, email, address, city, state, pincode, gstNumber, upiId, upiQrImage } = req.body;
    const [vendor] = await db.update(vendorsTable)
      .set({ businessName, description, logo, banner, phone, email, address, city, state, pincode, gstNumber, upiId, upiQrImage, updatedAt: new Date() })
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
