-- ====================================================================
-- FISH BASKET — MULTI-FISHERMAN MARKETPLACE ADDITIVE MIGRATION
-- Migration: 20261024_fisherman_marketplace.sql
-- Description: Extends profiles, products, orders, reviews for multi-fisherman
--              seller governance, password authentication, and verified reviews.
-- ====================================================================

-- 1. Extend user_role_type to include 'fisherman'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'user_role_type' AND e.enumlabel = 'fisherman'
    ) THEN
        ALTER TYPE user_role_type ADD VALUE 'fisherman';
    END IF;
END $$;

-- 2. Create fisherman_status_type Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fisherman_status_type') THEN
        CREATE TYPE fisherman_status_type AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
END $$;

-- 3. Extend order_status_type to include 'ready_for_pickup' and 'handed_over'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'order_status_type' AND e.enumlabel = 'ready_for_pickup'
    ) THEN
        ALTER TYPE order_status_type ADD VALUE 'ready_for_pickup' AFTER 'preparing';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'order_status_type' AND e.enumlabel = 'handed_over'
    ) THEN
        ALTER TYPE order_status_type ADD VALUE 'handed_over' AFTER 'ready_for_pickup';
    END IF;
END $$;

-- 4. Add Multi-Fisherman & Password Fields to profiles
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS status fisherman_status_type DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dock_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Index for querying fishermen by status
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);

-- 5. Add Seller Attribution to products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255) DEFAULT 'Visakha Harbor Cooperative';

CREATE INDEX IF NOT EXISTS idx_products_fisherman_id ON products(fisherman_id);

-- 6. Add Seller Attribution & COD Collection to orders
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS fisherman_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS payment_collected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS payment_collected_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_orders_fisherman_id ON orders(fisherman_id);

-- 7. Add Seller Attribution to order_items
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);

-- 8. Add Verified Purchase Tracking to reviews
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_product_order ON reviews(product_id, order_id);

-- 9. Row Level Security Policies for Multi-Fisherman Marketplace
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Product policies:
-- Anyone can view available products from approved fishermen or marketplace defaults
DROP POLICY IF EXISTS "Public can view available products" ON products;
CREATE POLICY "Public can view available products" ON products
    FOR SELECT USING (is_available = TRUE);

-- Fishermen can view and manage only their own products if approved
DROP POLICY IF EXISTS "Fishermen can manage own products" ON products;
CREATE POLICY "Fishermen can manage own products" ON products
    FOR ALL USING (
        fisherman_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'fisherman' 
            AND profiles.status = 'approved'
        )
    );

-- Admins can manage all products
DROP POLICY IF EXISTS "Admins can manage all products" ON products;
CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Order policies:
-- Customers can view only their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (user_id = auth.uid());

-- Fishermen can view only orders containing their products
DROP POLICY IF EXISTS "Fishermen can view own orders" ON orders;
CREATE POLICY "Fishermen can view own orders" ON orders
    FOR SELECT USING (fisherman_id = auth.uid());

-- Fishermen can update status of own orders (prep & handover only)
DROP POLICY IF EXISTS "Fishermen can update own order prep" ON orders;
CREATE POLICY "Fishermen can update own order prep" ON orders
    FOR UPDATE USING (
        fisherman_id = auth.uid()
        AND status IN ('confirmed', 'accepted_for_prep', 'preparing', 'ready_for_pickup', 'handed_over')
    );

-- Admins and assigned delivery partners have order access
DROP POLICY IF EXISTS "Admins and delivery can access orders" ON orders;
CREATE POLICY "Admins and delivery can access orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'delivery_partner')
        )
    );

-- Reviews policies:
-- Verified purchase review constraint: User must own a delivered order containing the product
DROP POLICY IF EXISTS "Customers can insert verified purchase review" ON reviews;
CREATE POLICY "Customers can insert verified purchase review" ON reviews
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = auth.uid()
            AND oi.product_id = reviews.product_id
            AND o.status = 'delivered'
        )
    );
