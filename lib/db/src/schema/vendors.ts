import { pgTable, serial, text, integer, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const vendorStatusEnum = pgEnum("vendor_status", ["pending", "approved", "rejected", "suspended"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["basic", "standard", "premium"]);

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  businessName: text("business_name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  gstNumber: text("gst_number"),
  upiId: text("upi_id"),
  upiQrImage: text("upi_qr_image"),
  status: vendorStatusEnum("status").notNull().default("pending"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").notNull().default("basic"),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  productCount: integer("product_count").notNull().default(0),
  totalSales: numeric("total_sales", { precision: 12, scale: 2 }).default("0"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendorsTable.$inferSelect;
