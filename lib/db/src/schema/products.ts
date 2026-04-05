import { pgTable, serial, text, integer, boolean, timestamp, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vendorsTable } from "./vendors";
import { categoriesTable } from "./categories";

export const productStatusEnum = pgEnum("product_status", ["pending", "approved", "rejected", "draft"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  images: json("images").$type<string[]>().default([]),
  images360: json("images_360").$type<string[]>().default([]),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  moq: integer("moq").notNull().default(1),
  unit: text("unit").default("piece"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  status: productStatusEnum("status").notNull().default("pending"),
  isFeatured: boolean("is_featured").notNull().default(false),
  bulkPricing: json("bulk_pricing").$type<Array<{minQty: number; maxQty?: number; price: number; discount?: number}>>().default([]),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
