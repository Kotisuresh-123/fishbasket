-- ====================================================================
-- FISH BASKET — DELIVERY PARTNER WORKFLOW, APPROVAL & REALTIME RLS
-- Migration: 20261024_delivery_partner_workflow.sql
-- Description: Adds delivery partner approval functions, unassigned
--              order discovery for approved fleet drivers, and realtime.
-- ====================================================================

-- 1. Add vehicle_info to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vehicle_info VARCHAR(255);

-- 2. Helper function to check if a user is an approved delivery partner (SECURITY DEFINER prevents recursion)
CREATE OR REPLACE FUNCTION public.is_approved_delivery_partner(did UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE (id = did OR auth_id = did)
      AND role = 'delivery_partner'
      AND status = 'approved'
  );
$$;

-- 3. Update orders RLS policies:
DROP POLICY IF EXISTS "Orders view policy" ON orders;
DROP POLICY IF EXISTS "Orders update policy" ON orders;

-- New Orders View Policy:
-- Customers: view their own orders
-- Fishermen: view orders containing their catches
-- Delivery Partners: view assigned orders OR eligible unassigned orders ready for pickup (if approved)
-- Admins: view all orders
CREATE POLICY "Orders view policy" ON orders
FOR SELECT USING (
  user_id = public.get_auth_profile_id()
  OR fisherman_id = public.get_auth_profile_id()
  OR (assigned_delivery_partner->>'id')::text = public.get_auth_profile_id()::text
  OR (
    public.is_approved_delivery_partner(public.get_auth_profile_id())
    AND (assigned_delivery_partner IS NULL OR assigned_delivery_partner->>'id' IS NULL)
    AND status IN ('ready_for_pickup', 'packed')
  )
  OR public.is_admin()
);

-- New Orders Update Policy:
-- Fishermen: update preparation status on own catches
-- Delivery Partners: update assigned deliveries OR claim eligible unassigned orders (if approved)
-- Admins: update all
CREATE POLICY "Orders update policy" ON orders
FOR UPDATE USING (
  fisherman_id = public.get_auth_profile_id()
  OR (assigned_delivery_partner->>'id')::text = public.get_auth_profile_id()::text
  OR (
    public.is_approved_delivery_partner(public.get_auth_profile_id())
    AND (assigned_delivery_partner IS NULL OR assigned_delivery_partner->>'id' IS NULL)
    AND status IN ('ready_for_pickup', 'packed')
  )
  OR public.is_admin()
);

-- 4. Ensure orders and profiles are in supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;
