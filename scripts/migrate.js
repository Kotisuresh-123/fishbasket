import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✓ Connected successfully to Supabase PostgreSQL database.');

    // 1. Extensions
    console.log('Enabling extensions...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Custom Enums
    console.log('Creating/verifying enum types...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
          CREATE TYPE user_role_type AS ENUM ('customer', 'admin', 'delivery_partner', 'fisherman');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fisherman_status_type') THEN
          CREATE TYPE fisherman_status_type AS ENUM ('pending', 'approved', 'rejected', 'suspended');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seafood_freshness_type') THEN
          CREATE TYPE seafood_freshness_type AS ENUM ('fresh_catch', 'chilled', 'frozen');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_discount_type') THEN
          CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'fixed');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_type') THEN
          CREATE TYPE order_status_type AS ENUM (
            'pending_confirmation',
            'confirmed',
            'accepted_for_prep',
            'preparing',
            'ready_for_pickup',
            'handed_over',
            'packed',
            'ready_for_dispatch',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'refund_initiated',
            'refunded'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
          CREATE TYPE payment_method_type AS ENUM ('razorpay', 'cod');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
          CREATE TYPE payment_status_type AS ENUM ('pending', 'success', 'failed', 'refunded');
        END IF;
      END $$;
    `);

    // 3. Profiles table
    console.log('Creating profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_id UUID UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role user_role_type NOT NULL DEFAULT 'customer',
        status fisherman_status_type DEFAULT 'approved',
        display_name VARCHAR(255),
        dock_location VARCHAR(255),
        avatar_url TEXT,
        password_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(role, status);
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    `);

    // 4. Addresses table
    console.log('Creating addresses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        label VARCHAR(50) NOT NULL DEFAULT 'Home',
        recipient_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        house_flat VARCHAR(255) NOT NULL,
        street_locality TEXT NOT NULL,
        landmark TEXT,
        city VARCHAR(100) NOT NULL DEFAULT 'Visakhapatnam',
        state VARCHAR(100) NOT NULL DEFAULT 'Andhra Pradesh',
        pincode VARCHAR(10) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        delivery_instructions TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
    `);

    // 5. Categories table
    console.log('Creating categories table...');
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `);

    // 6. Products table
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        seller_name VARCHAR(255) DEFAULT 'Visakha Harbor Cooperative',
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        variety_species VARCHAR(150),
        origin_source VARCHAR(150),
        description TEXT NOT NULL,
        price_per_unit NUMERIC(10, 2) NOT NULL,
        unit VARCHAR(20) NOT NULL DEFAULT 'kg',
        discount_price NUMERIC(10, 2),
        freshness seafood_freshness_type NOT NULL DEFAULT 'fresh_catch',
        stock_quantity NUMERIC(10, 3) NOT NULL DEFAULT 50.0,
        min_order_qty NUMERIC(10, 3) NOT NULL DEFAULT 1.0,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
        gross_weight_text VARCHAR(100),
        net_yield_text VARCHAR(100),
        estimated_prep_minutes INT NOT NULL DEFAULT 15,
        storage_instructions TEXT DEFAULT 'Store in freezer at -4°C to 0°C. Cook within 24 hours of delivery.',
        allergen_info TEXT DEFAULT 'Seafood product. Contains natural seafood allergens.',
        image_url TEXT,
        gallery_urls TEXT[],
        rating NUMERIC(3, 1) DEFAULT 4.8,
        review_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
      CREATE INDEX IF NOT EXISTS idx_products_fisherman_id ON products(fisherman_id);
    `);

    // 7. Product Variants and Preparation Options
    console.log('Creating product variants & preparation options...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_name VARCHAR(100) NOT NULL,
        weight_grams NUMERIC(10, 2) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        discount_price NUMERIC(10, 2),
        stock_quantity INT NOT NULL DEFAULT 20,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

      CREATE TABLE IF NOT EXISTS product_preparation_options (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        extra_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        est_weight_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_prep_options_product ON product_preparation_options(product_id);

      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Delivery Zones and Slots
    console.log('Creating delivery zones and slots...');
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode ON delivery_zones(pincode);

      CREATE TABLE IF NOT EXISTS delivery_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        max_orders_per_slot INT NOT NULL DEFAULT 50,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);

    // 9. Coupons table
    console.log('Creating coupons table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        discount_type coupon_discount_type NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        max_discount_amount NUMERIC(10, 2),
        starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        usage_limit INT,
        used_count INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
    `);

    // 10. Orders and Order Items
    console.log('Creating orders and order items...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(64) NOT NULL UNIQUE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        fisherman_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
        seller_name VARCHAR(255),
        status order_status_type NOT NULL DEFAULT 'confirmed',
        subtotal NUMERIC(10, 2) NOT NULL,
        cleaning_fee_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        total_amount NUMERIC(10, 2) NOT NULL,
        coupon_code VARCHAR(50),
        payment_method payment_method_type NOT NULL DEFAULT 'cod',
        payment_status payment_status_type NOT NULL DEFAULT 'pending',
        payment_collected_at TIMESTAMPTZ,
        payment_collected_by UUID REFERENCES profiles(id),
        delivery_address JSONB NOT NULL,
        delivery_slot JSONB NOT NULL,
        delivery_notes TEXT,
        cancelled_reason TEXT,
        assigned_delivery_partner JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_fisherman ON orders(fisherman_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        seller_name VARCHAR(255),
        product_name VARCHAR(255) NOT NULL,
        product_slug VARCHAR(255),
        product_image TEXT,
        variant_name VARCHAR(100),
        weight_grams NUMERIC(10, 2),
        preparation_name VARCHAR(100),
        cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        unit_price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        item_total NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_fisherman ON order_items(fisherman_id);
    `);

    // 11. Reviews table
    console.log('Creating reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        fisherman_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        author_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        comment TEXT NOT NULL,
        is_verified_buyer BOOLEAN NOT NULL DEFAULT TRUE,
        is_approved BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_fisherman ON reviews(fisherman_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
    `);

    // 12. Store Settings table
    console.log('Creating store_settings table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        store_name VARCHAR(100) NOT NULL DEFAULT 'Fish Basket',
        tagline VARCHAR(200) DEFAULT 'Fresh Catch. Delivered Fresh.',
        support_phone VARCHAR(20) DEFAULT '+91 89190 23456',
        support_email VARCHAR(100) DEFAULT 'care@fishbasket.in',
        support_address TEXT DEFAULT 'Harbor Road, Coastal Hub, Visakhapatnam, AP 530001',
        default_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
        free_delivery_threshold NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
        tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
        is_accepting_orders BOOLEAN NOT NULL DEFAULT TRUE,
        operational_hours VARCHAR(100) DEFAULT '06:00 AM - 09:00 PM',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 13. Password reset tokens table
    console.log('Creating password_reset_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 14. Row Level Security Policies
    console.log('Setting up Row Level Security (RLS) policies...');
    await client.query(`
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
      ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
      ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;
      ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
      ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

      -- Categories: Public read, Admin manage
      DROP POLICY IF EXISTS "Public can view active categories" ON categories;
      CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (true);

      -- Products: Public can view available products, Fishermen can manage own, Admin can manage all
      DROP POLICY IF EXISTS "Public can view available products" ON products;
      CREATE POLICY "Public can view available products" ON products FOR SELECT USING (is_available = TRUE);

      DROP POLICY IF EXISTS "Fishermen can manage own products" ON products;
      CREATE POLICY "Fishermen can manage own products" ON products FOR ALL USING (
        fisherman_id IN (
          SELECT id FROM profiles 
          WHERE (auth_id = auth.uid() OR id = auth.uid()) 
          AND role = 'fisherman' 
          AND status = 'approved'
        )
      );

      DROP POLICY IF EXISTS "Admins can manage all products" ON products;
      CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE (auth_id = auth.uid() OR id = auth.uid()) AND role = 'admin'
        )
      );

      -- Delivery zones, slots, settings: Public read
      DROP POLICY IF EXISTS "Public can view delivery zones" ON delivery_zones;
      CREATE POLICY "Public can view delivery zones" ON delivery_zones FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public can view delivery slots" ON delivery_slots;
      CREATE POLICY "Public can view delivery slots" ON delivery_slots FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Public can view store settings" ON store_settings;
      CREATE POLICY "Public can view store settings" ON store_settings FOR SELECT USING (true);

      -- Profiles: Users can view own profile or public fisherman info, Admin can view all
      DROP POLICY IF EXISTS "Users can view own profile or approved fishermen" ON profiles;
      CREATE POLICY "Users can view own profile or approved fishermen" ON profiles FOR SELECT USING (
        id = auth.uid() 
        OR auth_id = auth.uid()
        OR role = 'fisherman'
        OR EXISTS (
          SELECT 1 FROM profiles admin_p 
          WHERE (admin_p.id = auth.uid() OR admin_p.auth_id = auth.uid()) 
          AND admin_p.role = 'admin'
        )
      );

      -- Orders: Customers see own, Fishermen see own catch orders, Delivery partners see assigned, Admin see all
      DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
      CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_id = auth.uid())
      );

      DROP POLICY IF EXISTS "Fishermen can view own orders" ON orders;
      CREATE POLICY "Fishermen can view own orders" ON orders FOR SELECT USING (
        fisherman_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_id = auth.uid())
      );

      DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
      CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_id = auth.uid()) AND role = 'admin'
        )
      );

      -- Reviews: Public can view approved reviews, Customers can add
      DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
      CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
    `);

    console.log('✓ All database tables, indexes, constraints, and RLS policies created successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
