/**
 * Supabase Integration Examples
 * ==============================
 * This file demonstrates how to use the Supabase client alongside Drizzle ORM.
 *
 * Two clients are available from @workspace/db/supabase:
 *   - supabase        → uses the anon key (public, respects RLS)
 *   - supabaseAdmin   → uses the service role key (bypasses RLS, server-side only)
 *
 * Use Drizzle (db from @workspace/db) for all standard DB queries — it is the
 * primary data layer. Use supabase/supabaseAdmin for:
 *   - Realtime subscriptions
 *   - Supabase Storage (file uploads)
 *   - Supabase Auth helpers
 *   - Quick ad-hoc queries where the fluent API is convenient
 */

import { supabase, supabaseAdmin } from "@workspace/db/supabase";

// ---------------------------------------------------------------------------
// FETCH EXAMPLE 1: Select all approved products (with anon key / public access)
// ---------------------------------------------------------------------------
export async function fetchApprovedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`fetchApprovedProducts: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// FETCH EXAMPLE 2: Select a single product by slug (admin client)
// ---------------------------------------------------------------------------
export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(`fetchProductBySlug: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// FETCH EXAMPLE 3: Join products with categories (admin client)
// ---------------------------------------------------------------------------
export async function fetchProductsWithCategory() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      price,
      status,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("status", "approved")
    .limit(10);

  if (error) throw new Error(`fetchProductsWithCategory: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// INSERT EXAMPLE 1: Insert a new category (admin client)
// ---------------------------------------------------------------------------
export async function insertCategory(name: string, slug: string) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ name, slug })
    .select()
    .single();

  if (error) throw new Error(`insertCategory: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// INSERT EXAMPLE 2: Insert a product (admin client, returns the new row)
// ---------------------------------------------------------------------------
export async function insertProduct(product: {
  vendorId: number;
  categoryId: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
}) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      vendor_id: product.vendorId,
      category_id: product.categoryId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`insertProduct: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// REALTIME EXAMPLE: Subscribe to new orders (server-side)
// ---------------------------------------------------------------------------
export function subscribeToOrders(onOrder: (order: unknown) => void) {
  const channel = supabaseAdmin
    .channel("orders-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "orders" },
      (payload) => onOrder(payload.new),
    )
    .subscribe();

  return () => supabaseAdmin.removeChannel(channel);
}
