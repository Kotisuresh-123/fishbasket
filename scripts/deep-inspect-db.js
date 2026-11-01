import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('--- STORAGE BUCKETS ---');
  try {
    const buckets = await client.query('SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets');
    console.log('Buckets:', buckets.rows);
  } catch (e) {
    console.log('Storage buckets query error:', e.message);
  }

  try {
    const storagePolicies = await client.query(`
      SELECT policyname, tablename, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'storage'
    `);
    console.log('Storage policies:', storagePolicies.rows);
  } catch (e) {
    console.log('Storage policies query error:', e.message);
  }

  console.log('\n--- PUBLIC TABLE SCHEMAS ---');
  const targetTables = ['products', 'product_images', 'orders', 'order_items', 'profiles', 'store_settings'];
  for (const table of targetTables) {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    console.log(`\nTable: ${table}`);
    console.table(cols.rows);
  }

  console.log('\n--- FOREIGN KEYS ---');
  const fks = await client.query(`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
  `);
  console.log('Foreign Keys:', fks.rows);

  console.log('\n--- RLS POLICIES ---');
  const rls = await client.query(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `);
  console.log(`RLS policies count: ${rls.rows.length}`);
  rls.rows.forEach(p => console.log(`${p.tablename} | ${p.policyname} | ${p.cmd}`));

  console.log('\n--- STORE SETTINGS & PROFILES SAMPLE ---');
  const settings = await client.query('SELECT * FROM store_settings');
  console.log('Store settings:', settings.rows);

  const profiles = await client.query('SELECT id, email, full_name, role, status FROM profiles');
  console.log('Profiles:', profiles.rows);

  console.log('\n--- ORDERS SAMPLE ---');
  const orders = await client.query('SELECT id, order_number, user_id, status, payment_status, payment_method, total_amount, created_at FROM orders LIMIT 5');
  console.log('Orders sample:', orders.rows);

  console.log('\n--- ENUM TYPES ---');
  const enumsRes = await client.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `);
  const enums = {};
  enumsRes.rows.forEach(r => {
    if (!enums[r.typname]) enums[r.typname] = [];
    enums[r.typname].push(r.enumlabel);
  });
  console.log(enums);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
