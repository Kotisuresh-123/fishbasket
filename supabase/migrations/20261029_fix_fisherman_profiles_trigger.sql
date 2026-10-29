-- ====================================================================
-- FISH BASKET — REPAIR FISHERMAN PROFILES & SUPABASE AUTH LIFECYCLE
-- Migration: 20261029_fix_fisherman_profiles_trigger.sql
-- Description:
-- 1. Seeds essential verified role profiles (including fisherman1@fishbasket.in)
-- 2. Creates automatic, idempotent trigger on auth.users for Supabase Auth signups
-- 3. Syncs any orphaned auth.users to public.profiles safely
-- ====================================================================

-- 1. Ensure essential profiles exist in public.profiles with valid role and approval status
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    phone,
    role,
    status,
    dock_location,
    password_hash,
    created_at,
    updated_at
) VALUES
    ('11111111-1111-1111-1111-111111111111', 'customer@fishbasket.in', 'Suresh Kumar', 'Suresh Kumar', '+91 98765 43210', 'customer', 'approved', NULL, '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'admin@fishbasket.in', 'Admin Officer', 'Admin Officer', '+91 98765 43211', 'admin', 'approved', NULL, '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'delivery@fishbasket.in', 'Ramesh Delivery Fleet', 'Ramesh Delivery', '+91 98765 43212', 'delivery_partner', 'approved', NULL, '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'fisherman1@fishbasket.in', 'Ramana Rao', 'Captain Ramana (Bay Catch)', '+91 98765 43214', 'fisherman', 'approved', 'Visakhapatnam Harbor Jetty #3', '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'fisherman2@fishbasket.in', 'Subba Reddy', 'Godavari Delta Fishermen', '+91 98765 43215', 'fisherman', 'approved', 'Kakinada Estuary Pier', '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', 'fisherman_pending@fishbasket.in', 'Appala Naidu', 'Sagar Deep Fishery', '+91 98765 43216', 'fisherman', 'pending', 'Bheemili Beach Landing', '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    dock_location = COALESCE(profiles.dock_location, EXCLUDED.dock_location),
    password_hash = EXCLUDED.password_hash;

-- 2. Create authoritative trigger function to handle new Supabase Auth user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    assigned_role user_role_type;
    assigned_status fisherman_status_type;
    user_full_name TEXT;
    user_display_name TEXT;
    user_phone TEXT;
    user_dock TEXT;
    user_vehicle TEXT;
BEGIN
    -- Determine role from metadata or default to customer
    assigned_role := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role_type,
        'customer'::user_role_type
    );

    -- Enforce business rule: only customers default to approved; fishermen and delivery partners require admin approval
    IF assigned_role IN ('fisherman', 'delivery_partner') THEN
        assigned_status := 'pending'::fisherman_status_type;
    ELSE
        assigned_status := 'approved'::fisherman_status_type;
    END IF;

    user_display_name := NULLIF(NEW.raw_user_meta_data->>'display_name', '');
    user_full_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        user_display_name,
        split_part(NEW.email, '@', 1)
    );
    user_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
    user_dock := NULLIF(NEW.raw_user_meta_data->>'dock_location', '');
    user_vehicle := NULLIF(NEW.raw_user_meta_data->>'vehicle_info', '');

    -- Insert or safely recover existing profile by email
    INSERT INTO public.profiles (
        id,
        auth_id,
        email,
        full_name,
        display_name,
        phone,
        role,
        status,
        dock_location,
        vehicle_info,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        user_full_name,
        COALESCE(user_display_name, user_full_name),
        user_phone,
        assigned_role,
        assigned_status,
        user_dock,
        user_vehicle,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        auth_id = EXCLUDED.auth_id,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
        phone = COALESCE(profiles.phone, EXCLUDED.phone),
        dock_location = COALESCE(profiles.dock_location, EXCLUDED.dock_location),
        vehicle_info = COALESCE(profiles.vehicle_info, EXCLUDED.vehicle_info),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Idempotently sync any existing auth.users to profiles
INSERT INTO public.profiles (
    id,
    auth_id,
    email,
    full_name,
    display_name,
    phone,
    role,
    status,
    dock_location,
    vehicle_info,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.id,
    u.email,
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(u.raw_user_meta_data->>'display_name', ''),
        split_part(u.email, '@', 1)
    ),
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'display_name', ''),
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        split_part(u.email, '@', 1)
    ),
    NULLIF(u.raw_user_meta_data->>'phone', ''),
    COALESCE(NULLIF(u.raw_user_meta_data->>'role', '')::user_role_type, 'customer'::user_role_type),
    CASE 
        WHEN (u.raw_user_meta_data->>'role') IN ('fisherman', 'delivery_partner') THEN 'pending'::fisherman_status_type
        ELSE 'approved'::fisherman_status_type
    END,
    NULLIF(u.raw_user_meta_data->>'dock_location', ''),
    NULLIF(u.raw_user_meta_data->>'vehicle_info', ''),
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.email = u.email OR p.id = u.id OR p.auth_id = u.id
WHERE p.id IS NULL
ON CONFLICT (email) DO NOTHING;
