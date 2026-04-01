import { Router } from "express";
import { db } from "@workspace/db";
import {
  vendorsTable, usersTable, productsTable, ordersTable, couponsTable,
  subscriptionPlansTable, vendorSubscriptionsTable, commissionSettingsTable, activityLogsTable,
  contactMessagesTable, bannersTable, emailLogsTable, paymentsTable, categoriesTable, contactInfoTable,
} from "@workspace/db/schema";
import { eq, count, sum, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../lib/auth.js";
import { slugify } from "../lib/slugify.js";
import { logActivity } from "../lib/activity.js";
import { logEmail } from "../lib/email-log.js";
import { createNotification } from "../lib/notify.js";

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
    const vendorId = Number(req.params.id);
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, vendorId));
    await db.update(vendorsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(vendorsTable.id, vendorId));
    if (vendor) {
      logActivity({ action: "vendor_approved", resource: "vendor", details: `Approved vendor: ${vendor.businessName || vendor.email}` });
      logEmail({
        recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
        recipientType: "vendor",
        subject: "Your Vendorkart Account Has Been Approved!",
        body: `Congratulations! Your vendor account (${vendor.businessName || vendor.email}) on Vendorkart has been approved. You can now start listing products and accepting orders.`,
        type: "vendor_approved",
        relatedId: vendor.id,
      });
      if (vendor.userId) {
        createNotification({ userId: vendor.userId, title: "Account Approved", message: "Your vendor account has been approved! You can now start listing products.", type: "vendor_approved" });
      }
    }
    return res.json({ message: "Vendor approved" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to approve vendor" });
  }
});

router.put("/vendors/:id/reject", async (req, res) => {
  try {
    const vendorId = Number(req.params.id);
    const { reason } = req.body;
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, vendorId));
    await db.update(vendorsTable)
      .set({ status: "rejected", rejectionReason: reason, updatedAt: new Date() })
      .where(eq(vendorsTable.id, vendorId));
    if (vendor) {
      logActivity({ action: "vendor_rejected", resource: "vendor", details: `Rejected vendor: ${vendor.businessName || vendor.email}. Reason: ${reason || "Not specified"}` });
      logEmail({
        recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
        recipientType: "vendor",
        subject: "Vendorkart Account Application Update",
        body: `Dear ${vendor.businessName || "Vendor"}, unfortunately your application to join Vendorkart as a vendor has not been approved at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nPlease contact support if you have any questions.`,
        type: "vendor_rejected",
        relatedId: vendor.id,
      });
      if (vendor.userId) {
        createNotification({ userId: vendor.userId, title: "Account Application Update", message: `Your vendor application was not approved.${reason ? ` Reason: ${reason}` : ""}`, type: "vendor_rejected" });
      }
    }
    return res.json({ message: "Vendor rejected" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reject vendor" });
  }
});

router.put("/vendors/:id/suspend", async (req, res) => {
  try {
    const vendorId = Number(req.params.id);
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, vendorId));
    const isCurrentlySuspended = vendor?.status === "suspended";
    await db.update(vendorsTable)
      .set({ status: isCurrentlySuspended ? "approved" as any : "suspended" as any, updatedAt: new Date() })
      .where(eq(vendorsTable.id, vendorId));
    if (vendor) {
      const action = isCurrentlySuspended ? "vendor_restored" : "vendor_suspended";
      logActivity({ action, resource: "vendor", details: `${isCurrentlySuspended ? "Restored" : "Suspended"} vendor: ${vendor.businessName || vendor.email}` });
      if (vendor.userId) {
        createNotification({
          userId: vendor.userId,
          title: isCurrentlySuspended ? "Account Restored" : "Account Suspended",
          message: isCurrentlySuspended ? "Your vendor account has been restored. You can now access the platform." : "Your vendor account has been suspended. Please contact support for assistance.",
          type: action,
        });
      }
    }
    return res.json({ message: isCurrentlySuspended ? "Vendor restored" : "Vendor suspended" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update vendor status" });
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
    const productId = Number(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    await db.update(productsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(productsTable.id, productId));
    if (product) {
      logActivity({ action: "product_approved", resource: "product", details: `Approved product: ${product.name}` });
    }
    return res.json({ message: "Product approved" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to approve product" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, vendorId, categoryId, price, comparePrice, stock, moq, unit, sku, status, isFeatured, description, shortDescription } = req.body;
    if (!name || !vendorId || !categoryId || !price) {
      return res.status(400).json({ message: "name, vendorId, categoryId, and price are required" });
    }
    const slug = slugify(name) + "-" + Date.now();
    const [product] = await db.insert(productsTable).values({
      name,
      slug,
      vendorId: Number(vendorId),
      categoryId: Number(categoryId),
      price: String(price),
      comparePrice: comparePrice ? String(comparePrice) : null,
      stock: Number(stock) || 0,
      moq: Number(moq) || 1,
      unit: unit || "piece",
      sku: sku || null,
      status: status || "approved",
      isFeatured: isFeatured ?? false,
      description: description || null,
      shortDescription: shortDescription || null,
    }).returning();
    logActivity({ action: "product_created", resource: "product", details: `Admin created product: ${product.name}` });
    return res.status(201).json({ ...product, price: Number(product.price) });
  } catch (err) {
    req.log.error({ err }, "Admin create product error");
    return res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, vendorId, categoryId, price, comparePrice, stock, moq, unit, sku, status, isFeatured, description, shortDescription } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) { updates.name = name; updates.slug = slugify(name) + "-" + productId; }
    if (vendorId !== undefined) updates.vendorId = Number(vendorId);
    if (categoryId !== undefined) updates.categoryId = Number(categoryId);
    if (price !== undefined) updates.price = String(price);
    if (comparePrice !== undefined) updates.comparePrice = comparePrice ? String(comparePrice) : null;
    if (stock !== undefined) updates.stock = Number(stock);
    if (moq !== undefined) updates.moq = Number(moq);
    if (unit !== undefined) updates.unit = unit;
    if (sku !== undefined) updates.sku = sku;
    if (status !== undefined) updates.status = status;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (description !== undefined) updates.description = description;
    if (shortDescription !== undefined) updates.shortDescription = shortDescription;
    const [updated] = await db.update(productsTable).set(updates).where(eq(productsTable.id, productId)).returning();
    if (!updated) return res.status(404).json({ message: "Product not found" });
    logActivity({ action: "product_updated", resource: "product", details: `Admin updated product: ${updated.name}` });
    return res.json({ ...updated, price: Number(updated.price) });
  } catch (err) {
    req.log.error({ err }, "Admin update product error");
    return res.status(500).json({ message: "Failed to update product" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);
    return res.json(cats);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list categories" });
  }
});

router.get("/vendors-list", async (_req, res) => {
  try {
    const vendors = await db.select({ id: vendorsTable.id, businessName: vendorsTable.businessName, email: vendorsTable.email })
      .from(vendorsTable).where(eq(vendorsTable.status, "approved"));
    return res.json(vendors);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendors" });
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

router.put("/orders/:id/verify-payment", async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be approve or reject" });
    }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isApprove = action === "approve";
    const [updated] = await db.update(ordersTable)
      .set({
        paymentStatus: isApprove ? "paid" : "failed",
        status: isApprove ? "confirmed" : "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId))
      .returning();

    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
    if (customer) {
      if (isApprove) {
        logEmail({
          recipient: customer.email,
          recipientType: "customer",
          subject: `Payment Approved – Order ${order.orderNumber}`,
          body: `Dear ${customer.name}, your payment for order #${order.orderNumber} has been verified and approved. Your order is now confirmed and will be processed shortly.`,
          type: "order_confirmed",
          relatedId: order.id,
        });
        createNotification({
          userId: customer.id,
          title: "Payment Approved",
          message: `Your payment for order #${order.orderNumber} has been verified. Order is now confirmed.`,
          type: "payment_approved",
        });
      } else {
        logEmail({
          recipient: customer.email,
          recipientType: "customer",
          subject: `Payment Rejected – Order ${order.orderNumber}`,
          body: `Dear ${customer.name}, unfortunately your payment screenshot for order #${order.orderNumber} could not be verified. Please contact support or try placing a new order.`,
          type: "order_cancelled",
          relatedId: order.id,
        });
        createNotification({
          userId: customer.id,
          title: "Payment Rejected",
          message: `Your payment screenshot for order #${order.orderNumber} was rejected. Please contact support.`,
          type: "payment_rejected",
        });
      }
    }

    logActivity({
      action: isApprove ? "payment_approved" : "payment_rejected",
      resource: "order",
      details: `Order ${order.orderNumber} payment ${isApprove ? "approved" : "rejected"} by admin`,
    });

    return res.json({ success: true, order: updated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify payment" });
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

router.get("/contact-messages", async (_req, res) => {
  try {
    const messages = await db.select().from(contactMessagesTable)
      .orderBy(sql`${contactMessagesTable.createdAt} DESC`);
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch contact messages" });
  }
});

router.put("/contact-messages/:id/read", async (req, res) => {
  try {
    await db.update(contactMessagesTable)
      .set({ status: "read" })
      .where(eq(contactMessagesTable.id, Number(req.params.id)));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update message" });
  }
});

router.get("/payments", async (_req, res) => {
  try {
    const payments = await db.select().from(paymentsTable)
      .orderBy(sql`${paymentsTable.createdAt} DESC`).limit(100);
    return res.json(payments.map(p => ({ ...p, amount: Number(p.amount) })));
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch payments" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    await db.delete(productsTable).where(eq(productsTable.id, productId));
    if (product) {
      logActivity({ action: "product_deleted", resource: "product", details: `Deleted product: ${product.name}` });
    }
    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    await db.delete(couponsTable).where(eq(couponsTable.id, Number(req.params.id)));
    return res.json({ message: "Coupon deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete coupon" });
  }
});

router.put("/subscription-plans/:id", async (req, res) => {
  try {
    const { name, price, billingCycle, maxProducts, maxCategories, canUploadBanner, isFeatured, isActive, features } = req.body;
    const slug = slugify(name);
    const [plan] = await db.update(subscriptionPlansTable)
      .set({ name, slug, price: String(price), billingCycle, maxProducts, maxCategories, canUploadBanner, isFeatured, isActive, features })
      .where(eq(subscriptionPlansTable.id, Number(req.params.id)))
      .returning();
    logActivity({ action: "subscription_plan_updated", resource: "subscription_plan", details: `Updated plan: ${name}` });
    return res.json({ ...plan, price: Number(plan.price) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update plan" });
  }
});

router.delete("/subscription-plans/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, id));
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    const activeCount = await db.select({ count: count() }).from(vendorSubscriptionsTable)
      .where(eq(vendorSubscriptionsTable.planId, id));
    if (Number(activeCount[0]?.count) > 0) {
      return res.status(400).json({ message: "Cannot delete a plan with active subscribers. Deactivate it instead." });
    }
    await db.delete(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, id));
    logActivity({ action: "subscription_plan_deleted", resource: "subscription_plan", details: `Deleted plan: ${plan.name}` });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete plan" });
  }
});

router.get("/banners", async (_req, res) => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(sql`${bannersTable.createdAt} DESC`);
    return res.json(banners);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch banners" });
  }
});

router.post("/banners", async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, isActive } = req.body;
    const [banner] = await db.insert(bannersTable).values({
      title, subtitle, imageUrl, linkUrl, position: position || "home_top", isActive: isActive ?? true,
    }).returning();
    return res.status(201).json(banner);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create banner" });
  }
});

router.put("/banners/:id", async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, isActive } = req.body;
    const [banner] = await db.update(bannersTable)
      .set({ title, subtitle, imageUrl, linkUrl, position, isActive })
      .where(eq(bannersTable.id, Number(req.params.id)))
      .returning();
    return res.json(banner);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update banner" });
  }
});

router.delete("/banners/:id", async (req, res) => {
  try {
    await db.delete(bannersTable).where(eq(bannersTable.id, Number(req.params.id)));
    return res.json({ message: "Banner deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete banner" });
  }
});

router.get("/subscription-payments", async (_req, res) => {
  try {
    const subs = await db.select().from(vendorSubscriptionsTable)
      .orderBy(sql`${vendorSubscriptionsTable.createdAt} DESC`)
      .limit(100);
    const result = await Promise.all(subs.map(async (s) => {
      const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, s.vendorId));
      const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, s.planId));
      return { ...s, paidAmount: s.paidAmount ? Number(s.paidAmount) : null, vendor, plan: plan ? { ...plan, price: Number(plan.price) } : null };
    }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch subscription payments" });
  }
});

router.put("/subscription-payments/:id/verify", async (req, res) => {
  try {
    const subId = Number(req.params.id);
    const { action, reason } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be approve or reject" });
    }

    const [sub] = await db.select().from(vendorSubscriptionsTable).where(eq(vendorSubscriptionsTable.id, subId));
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (sub.status !== "pending_verification") {
      return res.status(400).json({ message: "Only pending_verification subscriptions can be reviewed" });
    }

    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.id, sub.planId));
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, sub.vendorId));

    if (action === "approve") {
      const endDate = new Date(sub.startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      await db.update(vendorSubscriptionsTable)
        .set({ status: "active", endDate, autoRenew: true })
        .where(eq(vendorSubscriptionsTable.id, subId));

      if (vendor && plan) {
        await db.update(vendorsTable)
          .set({ subscriptionPlan: plan.slug as any, updatedAt: new Date() })
          .where(eq(vendorsTable.id, vendor.id));

        logEmail({
          recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
          recipientType: "vendor",
          subject: `Subscription Activated – ${plan.name} Plan`,
          body: `Your payment has been verified and your ${plan.name} plan is now active until ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Enjoy your benefits!`,
          type: "subscription_activated",
          relatedId: sub.id,
        });
      }

      logActivity({ action: "subscription_payment_approved", resource: "subscription", details: `Approved subscription payment for vendor #${sub.vendorId}, plan: ${plan?.name ?? sub.planId}` });
    } else {
      await db.update(vendorSubscriptionsTable)
        .set({ status: "rejected", rejectionReason: reason ?? "Payment could not be verified" })
        .where(eq(vendorSubscriptionsTable.id, subId));

      if (vendor && plan) {
        logEmail({
          recipient: vendor.email ?? `vendor-${vendor.id}@vendorkart.in`,
          recipientType: "vendor",
          subject: `Payment Rejected – ${plan.name} Plan`,
          body: `Unfortunately, your payment screenshot for the ${plan.name} plan could not be verified.${reason ? `\n\nReason: ${reason}` : ""}\n\nPlease contact support or submit a new payment.`,
          type: "subscription_activated",
          relatedId: sub.id,
        });
      }

      logActivity({ action: "subscription_payment_rejected", resource: "subscription", details: `Rejected subscription payment for vendor #${sub.vendorId}, plan: ${plan?.name ?? sub.planId}` });
    }

    const [updated] = await db.select().from(vendorSubscriptionsTable).where(eq(vendorSubscriptionsTable.id, subId));
    return res.json({ success: true, subscription: { ...updated, paidAmount: updated.paidAmount ? Number(updated.paidAmount) : null } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to verify subscription payment" });
  }
});

router.get("/contact-info", async (_req, res) => {
  try {
    const items = await db.select().from(contactInfoTable).orderBy(sql`${contactInfoTable.sortOrder} ASC`);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch contact info" });
  }
});

router.post("/contact-info", async (req, res) => {
  try {
    const { iconType, title, line1, line2, sub, color, sortOrder, isActive } = req.body;
    const [item] = await db.insert(contactInfoTable).values({
      iconType: iconType ?? "phone",
      title,
      line1,
      line2: line2 || null,
      sub: sub || null,
      color: color ?? "from-blue-500 to-indigo-600",
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();
    logActivity({ action: "contact_info_created", resource: "contact_info", details: `Created contact card: ${title}` });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create contact info" });
  }
});

router.put("/contact-info/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { iconType, title, line1, line2, sub, color, sortOrder, isActive } = req.body;
    const [item] = await db.update(contactInfoTable).set({
      iconType,
      title,
      line1,
      line2: line2 || null,
      sub: sub || null,
      color,
      sortOrder,
      isActive,
      updatedAt: new Date(),
    }).where(eq(contactInfoTable.id, id)).returning();
    logActivity({ action: "contact_info_updated", resource: "contact_info", details: `Updated contact card #${id}: ${title}` });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update contact info" });
  }
});

router.delete("/contact-info/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(contactInfoTable).where(eq(contactInfoTable.id, id));
    logActivity({ action: "contact_info_deleted", resource: "contact_info", details: `Deleted contact card #${id}` });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete contact info" });
  }
});

router.get("/email-logs", async (_req, res) => {
  try {
    const logs = await db.select().from(emailLogsTable)
      .orderBy(sql`${emailLogsTable.createdAt} DESC`).limit(200);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch email logs" });
  }
});

router.get("/reports", async (_req, res) => {
  try {
    const [{ totalVendors }] = await db.select({ totalVendors: count() }).from(vendorsTable);
    const [{ totalCustomers }] = await db.select({ totalCustomers: count() }).from(usersTable).where(eq(usersTable.role, "customer"));
    const [{ totalProducts }] = await db.select({ totalProducts: count() }).from(productsTable);
    const [{ totalOrders }] = await db.select({ totalOrders: count() }).from(ordersTable);
    const [{ totalRevenue }] = await db.select({ totalRevenue: sum(ordersTable.total) }).from(ordersTable).where(eq(ordersTable.paymentStatus, "paid"));
    const [{ pendingOrders }] = await db.select({ pendingOrders: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [{ approvedVendors }] = await db.select({ approvedVendors: count() }).from(vendorsTable).where(eq(vendorsTable.status, "approved"));
    const [{ totalPayments }] = await db.select({ totalPayments: count() }).from(paymentsTable);
    const topVendors = await db.select({ id: vendorsTable.id, businessName: vendorsTable.businessName, totalSales: vendorsTable.totalSales, productCount: vendorsTable.productCount }).from(vendorsTable).where(eq(vendorsTable.status, "approved")).orderBy(sql`${vendorsTable.totalSales} DESC`).limit(5);
    return res.json({
      totalVendors: Number(totalVendors),
      totalCustomers: Number(totalCustomers),
      totalProducts: Number(totalProducts),
      totalOrders: Number(totalOrders),
      pendingOrders: Number(pendingOrders),
      approvedVendors: Number(approvedVendors),
      totalPayments: Number(totalPayments),
      totalRevenue: Number(totalRevenue) || 0,
      topVendors,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
});

export default router;
