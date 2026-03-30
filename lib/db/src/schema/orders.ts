import { pgTable, serial, text, integer, boolean, timestamp, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", ["pending_payment", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => usersTable.id),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").default("upi_qr"),
  paymentScreenshot: text("payment_screenshot"),
  shippingAddress: json("shipping_address").$type<{
    name?: string; phone?: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; pincode: string; country?: string;
  }>(),
  items: json("items").$type<Array<{
    productId: number; productName: string; productImage?: string;
    vendorId: number; vendorName: string; quantity: number; price: number; subtotal: number;
  }>>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  couponCode: text("coupon_code"),
  notes: text("notes"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
