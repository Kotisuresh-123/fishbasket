-- ====================================================================
-- FISH BASKET — RLS POLICIES AUDIT & GAP REPAIR
-- Migration: 20261027_rls_policies_repair.sql
-- Description: Adds missing RLS policies for order_items, addresses,
--              coupons, orders INSERT, and profiles INSERT to ensure
--              complete security enforcement across all tables.
-- ====================================================================

-- 1. Ensure RLS is active on all operational tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Profiles INSERT policy
DROP POLICY IF EXISTS "Profiles insert policy" ON profiles;
CREATE POLICY "Profiles insert policy" ON profiles
FOR INSERT WITH CHECK (
  id = auth.uid() 
  OR auth_id = auth.uid() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

-- 3. Orders INSERT policy
DROP POLICY IF EXISTS "Orders insert policy" ON orders;
CREATE POLICY "Orders insert policy" ON orders
FOR INSERT WITH CHECK (
  user_id = public.get_auth_profile_id() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

-- 4. Order Items policies
DROP POLICY IF EXISTS "Order items view policy" ON order_items;
CREATE POLICY "Order items view policy" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = public.get_auth_profile_id()
      OR orders.fisherman_id = public.get_auth_profile_id()
      OR order_items.fisherman_id = public.get_auth_profile_id()
      OR (orders.assigned_delivery_partner->>'id')::text = public.get_auth_profile_id()::text
      OR public.is_admin()
    )
  )
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Order items insert policy" ON order_items;
CREATE POLICY "Order items insert policy" ON order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = public.get_auth_profile_id()
      OR public.is_admin()
    )
  )
  OR auth.role() = 'service_role'
);

-- 5. Addresses policies
DROP POLICY IF EXISTS "Addresses view policy" ON addresses;
CREATE POLICY "Addresses view policy" ON addresses
FOR SELECT USING (
  user_id = public.get_auth_profile_id() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Addresses insert policy" ON addresses;
CREATE POLICY "Addresses insert policy" ON addresses
FOR INSERT WITH CHECK (
  user_id = public.get_auth_profile_id() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Addresses update policy" ON addresses;
CREATE POLICY "Addresses update policy" ON addresses
FOR UPDATE USING (
  user_id = public.get_auth_profile_id() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Addresses delete policy" ON addresses;
CREATE POLICY "Addresses delete policy" ON addresses
FOR DELETE USING (
  user_id = public.get_auth_profile_id() 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);

-- 6. Coupons policies
DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
CREATE POLICY "Public can view active coupons" ON coupons
FOR SELECT USING (
  is_active = TRUE 
  OR public.is_admin()
  OR auth.role() = 'service_role'
);
