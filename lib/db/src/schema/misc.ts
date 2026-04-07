import { pgTable, serial, text, integer, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { vendorsTable } from "./vendors";
import { productsTable } from "./products";

export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high"]);
export const couponDiscountTypeEnum = pgEnum("coupon_discount_type", ["percentage", "fixed"]);

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id),
  customerId: integer("customer_id").notNull().references(() => usersTable.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name"),
  phone: text("phone"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  country: text("country").default("India"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: couponDiscountTypeEnum("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commissionSettingsTable = pgTable("commission_settings", {
  id: serial("id").primaryKey(),
  defaultRate: numeric("default_rate", { precision: 5, scale: 2 }).notNull().default("10"),
  categoryRates: text("category_rates").default("[]"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  resource: text("resource"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  position: text("position").notNull().default("home_top"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailLogsTable = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  recipient: text("recipient").notNull(),
  recipientType: text("recipient_type").notNull(),
  subject: text("subject").notNull(),
  body: text("body"),
  type: text("type").notNull(),
  status: text("status").notNull().default("sent"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactInfoTable = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  iconType: text("icon_type").notNull().default("phone"),
  title: text("title").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  sub: text("sub"),
  color: text("color").notNull().default("from-blue-500 to-indigo-600"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactMessagesTable = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  type: text("type"),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const socialLinksTable = pgTable("social_links", {
  id: serial("id").primaryKey(),
  facebook: text("facebook"),
  twitter: text("twitter"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  youtube: text("youtube"),
  whatsapp: text("whatsapp"),
  pinterest: text("pinterest"),
  telegram: text("telegram"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  githubUrl: text("github_url"),
  instagramUrl: text("instagram_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TeamMember = typeof teamMembersTable.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export const insertCouponSchema = createInsertSchema(couponsTable).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type Review = typeof reviewsTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type Wishlist = typeof wishlistTable.$inferSelect;
export type Address = typeof addressesTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;
export type Coupon = typeof couponsTable.$inferSelect;
export type ContactInfo = typeof contactInfoTable.$inferSelect;
export type ContactMessage = typeof contactMessagesTable.$inferSelect;
export type Banner = typeof bannersTable.$inferSelect;
export type EmailLog = typeof emailLogsTable.$inferSelect;
export type SocialLinks = typeof socialLinksTable.$inferSelect;
