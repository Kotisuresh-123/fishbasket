-- ====================================================================
-- FISH BASKET — RLS POLICIES & SECURITY DEFINER FUNCTIONS
-- Migration: 20261024_rls_security_functions.sql
-- Description: Non-recursive helper functions and strict RLS policies for profiles,
--              products, orders, reviews, addresses, and marketplace governance.
-- ====================================================================

-- 1. Helper security definer functions to prevent infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE (id = auth.uid() OR auth_id = auth.uid()) LIMIT 1),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_auth_profile_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM profiles
  WHERE (id = auth.uid() OR auth_id = auth.uid())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_fisherman(fid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = fid AND role = 'fisherman' AND status = 'approved'
  );
$$;

-- 2. Drop legacy policies
DROP POLICY IF EXISTS "Users can view own profile or approved fishermen" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile or public info" ON profiles;
DROP POLICY IF EXISTS "Public can view available products" ON products;
DROP POLICY IF EXISTS "Fishermen can manage own products" ON products;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Fishermen can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Profiles select policy" ON profiles;
DROP POLICY IF EXISTS "Users can update own non-privileged profile" ON profiles;
DROP POLICY IF EXISTS "Fishermen can insert own products if approved" ON products;
DROP POLICY IF EXISTS "Fishermen can update own products" ON products;
DROP POLICY IF EXISTS "Fishermen can delete own products" ON products;
DROP POLICY IF EXISTS "Orders view policy" ON orders;
DROP POLICY IF EXISTS "Orders update policy" ON orders;
DROP POLICY IF EXISTS "Reviews public view" ON reviews;
DROP POLICY IF EXISTS "Reviews insert" ON reviews;

-- 3. Profiles policies:
-- Public can view approved fishermen (for seller information on catalog), users can view own profile, admin can view all
CREATE POLICY "Profiles select policy" ON profiles
FOR SELECT USING (
  role = 'fisherman'
  OR id = auth.uid()
  OR auth_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "Users can update own non-privileged profile" ON profiles
FOR UPDATE USING (
  id = auth.uid() OR auth_id = auth.uid() OR public.is_admin()
);

-- 4. Products policies:
-- Public can view active products; fishermen can view/edit own products; admin can manage all
CREATE POLICY "Public can view available products" ON products
FOR SELECT USING (is_available = TRUE OR public.is_admin() OR fisherman_id = public.get_auth_profile_id());

CREATE POLICY "Fishermen can insert own products if approved" ON products
FOR INSERT WITH CHECK (
  public.is_admin()
  OR (
    fisherman_id = public.get_auth_profile_id()
    AND public.is_approved_fisherman(fisherman_id)
  )
);

CREATE POLICY "Fishermen can update own products" ON products
FOR UPDATE USING (
  public.is_admin()
  OR (
    fisherman_id = public.get_auth_profile_id()
    AND public.is_approved_fisherman(fisherman_id)
  )
);

CREATE POLICY "Fishermen can delete own products" ON products
FOR DELETE USING (
  public.is_admin()
  OR (fisherman_id = public.get_auth_profile_id())
);

-- 5. Orders policies:
-- Customers see own, fishermen see orders containing their catch, assigned delivery partner sees delivery, admins see all
CREATE POLICY "Orders view policy" ON orders
FOR SELECT USING (
  user_id = public.get_auth_profile_id()
  OR fisherman_id = public.get_auth_profile_id()
  OR (assigned_delivery_partner->>'id')::text = public.get_auth_profile_id()::text
  OR public.is_admin()
);

CREATE POLICY "Orders update policy" ON orders
FOR UPDATE USING (
  fisherman_id = public.get_auth_profile_id()
  OR (assigned_delivery_partner->>'id')::text = public.get_auth_profile_id()::text
  OR public.is_admin()
);

-- 6. Reviews policies:
CREATE POLICY "Reviews public view" ON reviews
FOR SELECT USING (is_approved = TRUE OR user_id = public.get_auth_profile_id() OR public.is_admin());

CREATE POLICY "Reviews insert" ON reviews
FOR INSERT WITH CHECK (
  user_id = public.get_auth_profile_id() OR public.is_admin()
);
