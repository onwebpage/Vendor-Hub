import { pgTable, serial, text, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vendorsTable } from "./vendors";

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  maxProducts: integer("max_products").default(-1),
  maxImages: integer("max_images").default(5),
  maxCategories: integer("max_categories").default(-1),
  canUploadBanner: boolean("can_upload_banner").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  features: json("features").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vendorSubscriptionsTable = pgTable("vendor_subscriptions", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlansTable.id),
  status: text("status").notNull().default("pending_verification"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").notNull().default(true),
  utrNumber: text("utr_number"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }),
  paymentScreenshot: text("payment_screenshot"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlansTable).omit({ id: true, createdAt: true });
export const insertVendorSubscriptionSchema = createInsertSchema(vendorSubscriptionsTable).omit({ id: true, createdAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;
export type VendorSubscription = typeof vendorSubscriptionsTable.$inferSelect;
