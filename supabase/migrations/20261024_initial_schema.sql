-- ====================================================================
-- FISH BASKET — COMPLETE POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Migration: 20261024_initial_schema.sql
-- Description: Core eCommerce, Inventory, Orders, Payments & RBAC schema
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Roles Enum & Profiles
CREATE TYPE user_role_type AS ENUM ('customer', 'admin', 'delivery_partner');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- References auth.users(id) in Supabase
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role_type NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customer Delivery Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home', -- Home, Work, Other
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    house_flat VARCHAR(255) NOT NULL,
    street_locality TEXT NOT NULL,
    landmark TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Products
CREATE TYPE seafood_freshness_type AS ENUM ('fresh_catch', 'chilled', 'frozen');

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    variety_species VARCHAR(150), -- e.g. "Labeo rohita", "Penaeus monodon"
    origin_source VARCHAR(150),   -- e.g. "Pulicat Lake", "Bay of Bengal", "Godavari Freshwaters"
    description TEXT NOT NULL,
    price_per_unit NUMERIC(10, 2) NOT NULL, -- Base price per primary unit
    unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'kg', '500g', 'pack', 'piece'
    discount_price NUMERIC(10, 2),          -- Strikethrough promotional price if present
    freshness seafood_freshness_type NOT NULL DEFAULT 'fresh_catch',
    stock_quantity NUMERIC(10, 3) NOT NULL DEFAULT 50.0, -- In weight (kg) or count
    min_order_qty NUMERIC(10, 3) NOT NULL DEFAULT 1.0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    gross_weight_text VARCHAR(100),         -- e.g. "Gross: 1000g"
    net_yield_text VARCHAR(100),            -- e.g. "Net Cleaned: 700g - 750g"
    estimated_prep_minutes INT NOT NULL DEFAULT 15,
    storage_instructions TEXT DEFAULT 'Store in freezer at -4°C to 0°C. Cook within 24 hours of delivery.',
    allergen_info TEXT DEFAULT 'Seafood product. Contains natural seafood allergens.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Product Weight Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,    -- e.g. "500g Pack", "1 kg Whole", "250g Sample"
    weight_grams NUMERIC(10, 2) NOT NULL,  -- Weight in grams
    price NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    stock_quantity INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Product Preparation & Cleaning Options
CREATE TABLE IF NOT EXISTS product_preparation_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,             -- e.g. "Whole Uncleaned", "Curry Cut", "Fry Cut", "Peeled & Deveined"
    description TEXT,
    extra_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    est_weight_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- e.g. 25% waste removed
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Inventory & Stock Adjustments
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_available NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    reserved_quantity NUMERIC(10, 3) NOT NULL DEFAULT 0.0,
    low_stock_threshold NUMERIC(10, 3) NOT NULL DEFAULT 5.0,
    batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE inventory_movement_type AS ENUM ('restock', 'order_deduction', 'adjustment', 'damage_writeoff');

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type inventory_movement_type NOT NULL,
    quantity_changed NUMERIC(10, 3) NOT NULL,
    reference_id VARCHAR(100), -- Order ID or Batch Number
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Carts and Cart Items
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    preparation_id UUID REFERENCES product_preparation_options(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    custom_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

-- 12. Coupons & Discounts
CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'fixed');

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type coupon_discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount NUMERIC(10, 2), -- Cap for percentage discounts
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID,
    discount_applied NUMERIC(10, 2) NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Delivery Zones & Delivery Slots
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode VARCHAR(10) NOT NULL UNIQUE,
    area_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Visakhapatnam',
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
    min_order_for_free_delivery NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
    is_serviceable BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_delivery_hours INT NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g. "Early Morning 06:30 AM - 09:30 AM"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders_per_slot INT NOT NULL DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 14. Orders and Order Items
CREATE TYPE order_status_type AS ENUM (
    'pending_confirmation',
    'confirmed',
    'accepted_for_prep',
    'preparing',
    'packed',
    'ready_for_dispatch',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refund_initiated',
    'refunded'
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status order_status_type NOT NULL DEFAULT 'pending_confirmation',
    subtotal NUMERIC(10, 2) NOT NULL,
    cleaning_fee_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_address_snapshot JSONB NOT NULL,
    delivery_slot_snapshot JSONB NOT NULL,
    delivery_notes TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot VARCHAR(255) NOT NULL,
    product_image_snapshot TEXT,
    variant_snapshot JSONB,
    preparation_snapshot JSONB,
    unit_price NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1,
    item_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_type NOT NULL,
    notes TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Payments & Refunds
CREATE TYPE payment_method_type AS ENUM ('razorpay', 'cod');
CREATE TYPE payment_status_type AS ENUM ('pending', 'success', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method_type NOT NULL DEFAULT 'razorpay',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    status payment_status_type NOT NULL DEFAULT 'pending',
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    razorpay_refund_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Delivery Assignments
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    delivery_partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_reason TEXT,
    partner_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned'
);

-- 17. Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Store Settings
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name VARCHAR(100) NOT NULL DEFAULT 'Fish Basket',
    tagline VARCHAR(200) DEFAULT 'Fresh Catch. Delivered Fresh.',
    support_phone VARCHAR(20) DEFAULT '+91 89190 23456',
    support_email VARCHAR(100) DEFAULT 'care@fishbasket.in',
    support_address TEXT DEFAULT 'Harbor Road, Coastal Hub, Visakhapatnam, AP 530001',
    default_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
    free_delivery_threshold NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Raw seafood is generally 0% GST in India
    is_accepting_orders BOOLEAN NOT NULL DEFAULT TRUE,
    operational_hours VARCHAR(100) DEFAULT '06:00 AM - 09:00 PM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode ON delivery_zones(pincode);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
