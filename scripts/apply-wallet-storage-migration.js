import { Client } from 'pg';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to PostgreSQL for wallet and storage migration...');

  try {
    await client.query('BEGIN');

    // 1. Supabase Storage Bucket for catches
    console.log('1. Configuring Supabase Storage bucket for catches...');
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('catches', 'catches', true, 5242880, '{image/jpeg,image/png,image/webp}')
      ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 5242880,
        allowed_mime_types = '{image/jpeg,image/png,image/webp}';
    `);

    // Storage policy: allow public read on catches bucket
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Catches'
        ) THEN
          CREATE POLICY "Public Access for Catches" ON storage.objects
          FOR SELECT USING (bucket_id = 'catches');
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads to Catches'
        ) THEN
          CREATE POLICY "Allow Uploads to Catches" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'catches');
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Updates to Catches'
        ) THEN
          CREATE POLICY "Allow Updates to Catches" ON storage.objects
          FOR UPDATE USING (bucket_id = 'catches');
        END IF;
      END $$;
    `);

    // 2. Enum type updates for payment_method_type
    console.log('2. Updating payment_method_type enum values...');
    await client.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'wallet';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
          ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'wallet_advance_cod';
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
      END $$;
    `);

    // 3. Orders table columns extension
    console.log('3. Extending orders table with advance and wallet columns...');
    await client.query(`
      ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS advance_amount numeric(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS advance_payment_status character varying(30) DEFAULT 'unpaid',
        ADD COLUMN IF NOT EXISTS remaining_amount numeric(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS remaining_payment_method character varying(30) DEFAULT 'cod',
        ADD COLUMN IF NOT EXISTS remaining_payment_status character varying(30) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS advance_released_to_fisherman boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS refund_amount numeric(12, 2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS refund_status character varying(30) DEFAULT 'none';
    `);

    // 4. Store settings extension
    console.log('4. Extending store_settings with initial wallet balance setting...');
    await client.query(`
      ALTER TABLE store_settings
        ADD COLUMN IF NOT EXISTS initial_customer_wallet_balance numeric(12, 2) DEFAULT 1000.00;
    `);

    // 5. Wallets table
    console.log('5. Creating wallets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE RESTRICT,
        role user_role_type NOT NULL DEFAULT 'customer',
        balance numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
        pending_balance numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0.00),
        currency character varying(10) NOT NULL DEFAULT 'INR',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
    `);

    // 6. Wallet transactions table (Auditable Ledger)
    console.log('6. Creating wallet_transactions ledger table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
        user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
        transaction_type character varying(50) NOT NULL,
        amount numeric(12, 2) NOT NULL CHECK (amount > 0.00),
        direction character varying(10) NOT NULL CHECK (direction IN ('credit', 'debit')),
        status character varying(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
        balance_after numeric(12, 2) NOT NULL CHECK (balance_after >= 0.00),
        reference_id character varying(100),
        idempotency_key character varying(100) UNIQUE,
        description text NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb,
        created_at timestamp with time zone NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON wallet_transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_order_id ON wallet_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_tx_idempotency ON wallet_transactions(idempotency_key);
    `);

    await client.query('COMMIT');
    console.log('✓ Wallet & Storage migration applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

runMigration().catch((e) => {
  console.error(e);
  process.exit(1);
});
