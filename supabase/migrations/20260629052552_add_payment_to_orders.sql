/*
# Add payment metadata column to orders

1. Overview
Adds a `payment` jsonb column to the `orders` table to store Flutterwave transaction
metadata: tx_ref, transaction_id, status, amount, currency, and verified flag.

2. Modified Tables
- orders: + payment jsonb (nullable). Stores payment gateway response after checkout.

3. Security
- No policy changes. Existing owner-scoped RLS on orders covers the new column.

4. Notes
- Idempotent (IF NOT EXISTS). No data loss — column is nullable with no default.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment jsonb;
