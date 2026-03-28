import { Router } from "express";
import { db } from "@workspace/db";
import {
  vendorsTable, usersTable, productsTable, ordersTable, couponsTable,
  subscriptionPlansTable, commissionSettingsTable, activityLogsTable,
} from "@workspace/db/schema";
import { eq, count, sum, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { slugify } from "../lib/slugify.js";

const router = Router();
router.use(authenticate, requireRole("admin"));

router.get("/stats", async (req, res) => {
  try {
    const [{ totalVendors }] = await db.select({ totalVendors: count() }).from(vendorsTable);
    const [{ pendingVendors }] = await db.select({ pendingVendors: count() }).from(vendorsTable)
      .where(eq(vendorsTable.status, "pending"));
    const [{ approvedVendors }] = await db.select({ approvedVendors: count() }).from(vendorsTable)
      .where(eq(vendorsTable.status, "approved"));
    const [{ totalCustomers }] = await db.select({ totalCustomers: count() }).from(usersTable)
      .where(eq(usersTable.role, "customer"));
    const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(productsTable);
    const [{ pendingProducts }] = await db.select({ pendingProducts: count() }).from(productsTable)
      .where(eq(productsTable.status, "pending"));
    const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(ordersTable);
    const [{ pendingOrders }] = await db.select({ pendingOrders: count() }).from(ordersTable)
      .where(eq(ordersTable.status, "pending"));
    const [{ totalRevenue }] = await db.select({ totalRevenue: sum(ordersTable.total) }).from(ordersTable)
      .where(eq(ordersTable.paymentStatus, "paid"));

    const recentOrders = await db.select().from(ordersTable)
      .orderBy(sql`${ordersTable.createdAt} DESC`).limit(5);
    const topVendors = await db.select().from(vendorsTable)
      .where(eq(vendorsTable.status, "approved"))
      .orderBy(sql`${vendorsTable.totalSales} DESC`).limit(5);

    return res.json({
      totalVendors: Number(totalVendors),
      pendingVendors: Number(pendingVendors),
      approvedVendors: Number(approvedVendors),
      totalCustomers: Number(totalCustomers),
      totalProducts: Number(totalProducts),
      pendingProducts: Number(pendingProducts),
      totalOrders: Number(totalOrders),
      pendingOrders: Number(pendingOrders),
      totalRevenue: Number(totalRevenue) || 0,
      monthlyRevenue: Number(totalRevenue) * 0.3 || 0,
      recentOrders,
      topVendors,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    return res.status(500).json({ message: "Failed to get stats" });
  }
});

router.get("/vendors", async (req, res) => {
  try {
    const status = req.query.status as string;
    let vendors;
    if (status) {
      vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.status, status as any));
    } else {
      vendors = await db.select().from(vendorsTable);
    }
    return res.json({ vendors, total: vendors.length, page: 1, totalPages: 1 });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendors" });
  }
});

router.put("/vendors/:id/approve", async (req, res) => {
  try {
    await db.update(vendorsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(vendorsTable.id, Number(req.params.id)));
    return res.json({ message: "Vendor approved" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to approve vendor" });
  }
});

router.put("/vendors/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    await db.update(vendorsTable)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(vendorsTable.id, Number(req.params.id)));
    return res.json({ message: "Vendor rejected" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reject vendor" });
  }
});

router.put("/vendors/:id/suspend", async (req, res) => {
  try {
    await db.update(vendorsTable)
      .set({ status: "suspended" as any, updatedAt: new Date() })
      .where(eq(vendorsTable.id, Number(req.params.id)));
    return res.json({ message: "Vendor suspended" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to suspend vendor" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const status = req.query.status as string;
    let products;
    if (status) {
      products = await db.select().from(productsTable).where(eq(productsTable.status, status as any));
    } else {
      products = await db.select().from(productsTable);
    }
    return res.json({ products: products.map(p => ({ ...p, price: Number(p.price) })), total: products.length, page: 1, totalPages: 1 });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list products" });
  }
});

router.put("/products/:id/approve", async (req, res) => {
  try {
    await db.update(productsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(productsTable.id, Number(req.params.id)));
    return res.json({ message: "Product approved" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to approve product" });
  }
});

router.get("/customers", async (_req, res) => {
  try {
    const customers = await db.select().from(usersTable).where(eq(usersTable.role, "customer"));
    return res.json(customers.map(({ password: _, ...u }) => u));
  } catch (err) {
    return res.status(500).json({ message: "Failed to list customers" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const orders = await db.select().from(ordersTable)
      .orderBy(sql`${ordersTable.createdAt} DESC`)
      .limit(limit).offset(offset);
    return res.json({ orders, total: orders.length, page });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list orders" });
  }
});

router.get("/coupons", async (_req, res) => {
  const coupons = await db.select().from(couponsTable);
  return res.json(coupons.map(c => ({ ...c, discountValue: Number(c.discountValue) })));
});

router.post("/coupons", async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
  const [coupon] = await db.insert(couponsTable).values({
    code: code.toUpperCase(),
    discountType,
    discountValue: String(discountValue),
    minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
    maxUses,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  return res.status(201).json({ ...coupon, discountValue: Number(coupon.discountValue) });
});

router.get("/subscription-plans", async (_req, res) => {
  const plans = await db.select().from(subscriptionPlansTable);
  return res.json(plans.map(p => ({ ...p, price: Number(p.price) })));
});

router.post("/subscription-plans", async (req, res) => {
  const { name, price, billingCycle, maxProducts, maxCategories, canUploadBanner, isFeatured, features } = req.body;
  const slug = slugify(name);
  const [plan] = await db.insert(subscriptionPlansTable).values({
    name, slug, price: String(price), billingCycle: billingCycle || "monthly",
    maxProducts: maxProducts ?? -1, maxCategories: maxCategories ?? -1,
    canUploadBanner: canUploadBanner ?? false, isFeatured: isFeatured ?? false,
    features: features || [],
  }).returning();
  return res.status(201).json({ ...plan, price: Number(plan.price) });
});

router.get("/commission", async (_req, res) => {
  const [settings] = await db.select().from(commissionSettingsTable);
  if (!settings) return res.json({ defaultRate: 10, categoryRates: [] });
  return res.json({ defaultRate: Number(settings.defaultRate), categoryRates: JSON.parse(settings.categoryRates || "[]") });
});

router.put("/commission", async (req, res) => {
  const { defaultRate, categoryRates } = req.body;
  const existing = await db.select().from(commissionSettingsTable);
  if (existing.length > 0) {
    await db.update(commissionSettingsTable)
      .set({ defaultRate: String(defaultRate), categoryRates: JSON.stringify(categoryRates || []), updatedAt: new Date() })
      .where(eq(commissionSettingsTable.id, existing[0].id));
  } else {
    await db.insert(commissionSettingsTable).values({
      defaultRate: String(defaultRate), categoryRates: JSON.stringify(categoryRates || []),
    });
  }
  return res.json({ defaultRate, categoryRates });
});

router.get("/activity-logs", async (_req, res) => {
  const logs = await db.select().from(activityLogsTable)
    .orderBy(sql`${activityLogsTable.createdAt} DESC`).limit(100);
  return res.json(logs);
});

export default router;
