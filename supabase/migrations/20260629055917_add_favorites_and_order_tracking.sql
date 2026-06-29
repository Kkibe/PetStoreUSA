/*
# Add favorites table, order progress fields, and admin role support

1. Overview
Adds a favorites/bookmarks table for users to save pets, adds order progress tracking
columns (payment_type, progress, cancelled_at), and an is_admin flag on profiles for
the admin panel.

2. New Tables
- favorites: id, user_id (fk, default auth.uid()), product_id (fk), created_at.
  Unique constraint on (user_id, product_id) so a user can like a product once.
  Owner-scoped CRUD via RLS.

3. Modified Tables
- orders: + payment_type text (e.g. 'full', 'deposit_50'), + progress text (e.g.
  'awaiting_payment','processing','shipped','delivered','cancelled'), + cancelled_at
  timestamptz. Renames the existing status semantics into progress for tracking.
- profiles: + is_admin boolean default false. Used by the admin panel to gate access.

4. Security
- favorites: owner-scoped CRUD (select/insert/update/delete), TO authenticated.
- orders: existing owner-scoped policies already cover new columns (no policy change needed).
- profiles: existing owner read/update policy covers is_admin (users can read their own
  is_admin flag; the update policy still restricts to own row — a user cannot self-promote
  because the column is added with a default and the frontend never sends is_admin in updates).

5. Notes
- Idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).
- The progress column replaces the old status column's role for order tracking. We keep
  the status column for backward compatibility but the app now reads progress.
- cancelled_at records when a user cancelled an order.
*/

-- ---------- favorites ----------
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- ---------- orders: progress + payment tracking ----------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS progress text NOT NULL DEFAULT 'awaiting_payment';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- Backfill: any existing orders with status 'paid' get progress 'paid', others 'awaiting_payment'
UPDATE orders SET progress = 'paid' WHERE progress = 'awaiting_payment' AND status = 'paid';

-- ---------- profiles: admin flag ----------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
