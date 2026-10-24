import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is required.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  console.log('=== DATABASE RESET AUDIT & INSPECTION ===\n');

  try {
    // 1. List all public tables and row counts
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('1. Public Tables & Row Counts:');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM public."${row.table_name}"`);
      console.log(`   - ${row.table_name}: ${countRes.rows[0].count} rows`);
    }

    // 2. Auth Users
    console.log('\n2. Supabase Auth Users (auth.users):');
    try {
      const authRes = await client.query(`
        SELECT id, email, role, created_at, last_sign_in_at
        FROM auth.users
        ORDER BY created_at ASC;
      `);
      console.log(`   Total Auth Users: ${authRes.rows.length}`);
      authRes.rows.forEach(u => {
        console.log(`   - [${u.id}] ${u.email} (Auth Role: ${u.role}, Created: ${u.created_at})`);
      });
    } catch (e) {
      console.log('   Could not query auth.users:', e.message);
    }

    // 3. Profiles (public.profiles)
    console.log('\n3. Profiles Breakdown (public.profiles):');
    const profilesRes = await client.query(`
      SELECT id, email, full_name, role, status, created_at
      FROM public.profiles
      ORDER BY role, created_at ASC;
    `);
    profilesRes.rows.forEach(p => {
      console.log(`   - [${p.id}] Role: ${p.role} | Status: ${p.status} | Email: ${p.email} | Name: ${p.full_name}`);
    });

    // 4. Foreign Key Constraints
    console.log('\n4. Foreign Key Relationships in Public Schema:');
    const fkRes = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    fkRes.rows.forEach(fk => {
      console.log(`   - ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (ON DELETE ${fk.delete_rule})`);
    });

    // 5. Orders breakdown
    console.log('\n5. Orders Breakdown by Status:');
    const orderStatusRes = await client.query(`
      SELECT status, COUNT(*)::int as count
      FROM public.orders
      GROUP BY status
      ORDER BY count DESC;
    `);
    orderStatusRes.rows.forEach(s => {
      console.log(`   - Status "${s.status}": ${s.count} orders`);
    });

    // 6. Products breakdown
    console.log('\n6. Products Breakdown:');
    const productsRes = await client.query(`
      SELECT p.id, p.name, p.fisherman_id, pr.full_name as seller_name, p.stock_quantity, p.is_available
      FROM public.products p
      LEFT JOIN public.profiles pr ON pr.id = p.fisherman_id;
    `);
    console.log(`   Total Products: ${productsRes.rows.length}`);
    productsRes.rows.forEach(p => {
      console.log(`   - [${p.id}] "${p.name}" (Fisherman ID: ${p.fisherman_id}, Seller: ${p.seller_name}, Stock: ${p.stock_quantity})`);
    });

    // 7. Reviews breakdown
    console.log('\n7. Reviews Breakdown:');
    const reviewsRes = await client.query(`
      SELECT r.id, r.author_name, r.rating, r.product_id, r.order_id, r.user_id
      FROM public.reviews r;
    `);
    console.log(`   Total Reviews: ${reviewsRes.rows.length}`);
    reviewsRes.rows.forEach(r => {
      console.log(`   - Review [${r.id}] by ${r.author_name} for Product ${r.product_id} (Order: ${r.order_id}, User: ${r.user_id})`);
    });

    // 8. Addresses breakdown
    console.log('\n8. Addresses:');
    const addrRes = await client.query(`
      SELECT a.id, a.user_id, a.recipient_name, a.label, a.city, a.pincode
      FROM public.addresses a;
    `);
    console.log(`   Total Addresses: ${addrRes.rows.length}`);
    addrRes.rows.forEach(a => {
      console.log(`   - [${a.id}] User ${a.user_id}: ${a.recipient_name} (${a.label}, ${a.city} ${a.pincode})`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
