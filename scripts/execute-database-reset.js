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
  console.log('=== EXECUTING APPROVED DATABASE RESET ===\n');

  try {
    await client.query('BEGIN');

    // 1. Verify Admin account before touching anything
    const adminCheck = await client.query(`
      SELECT id, email, full_name, role, status
      FROM public.profiles
      WHERE role = 'admin' AND email = 'admin@fishbasket.in'
    `);
    if (adminCheck.rows.length === 0) {
      throw new Error('ABORT: Admin account admin@fishbasket.in not found in public.profiles!');
    }
    const adminUser = adminCheck.rows[0];
    console.log(`✓ Confirmed Admin account to PRESERVE: [${adminUser.id}] ${adminUser.email} (${adminUser.full_name}, status: ${adminUser.status})\n`);

    // 2. Delete Product Reviews (3 rows)
    const delReviews = await client.query(`DELETE FROM public.reviews RETURNING id`);
    console.log(`✓ Deleted reviews: ${delReviews.rows.length} rows`);

    // 3. Delete Order Items (11 rows)
    const delOrderItems = await client.query(`DELETE FROM public.order_items RETURNING id`);
    console.log(`✓ Deleted order_items: ${delOrderItems.rows.length} rows`);

    // 4. Delete Orders (9 rows - all historical & active orders)
    const delOrders = await client.query(`DELETE FROM public.orders RETURNING id`);
    console.log(`✓ Deleted orders: ${delOrders.rows.length} rows`);

    // 5. Delete Product Images (0 rows)
    const delProdImages = await client.query(`DELETE FROM public.product_images RETURNING id`);
    console.log(`✓ Deleted product_images: ${delProdImages.rows.length} rows`);

    // 6. Delete Product Preparation Options (8 rows)
    const delPrepOpts = await client.query(`DELETE FROM public.product_preparation_options RETURNING id`);
    console.log(`✓ Deleted product_preparation_options: ${delPrepOpts.rows.length} rows`);

    // 7. Delete Product Variants (8 rows)
    const delVariants = await client.query(`DELETE FROM public.product_variants RETURNING id`);
    console.log(`✓ Deleted product_variants: ${delVariants.rows.length} rows`);

    // 8. Delete Products (9 rows - fisherman-owned products)
    const delProducts = await client.query(`DELETE FROM public.products RETURNING id`);
    console.log(`✓ Deleted products: ${delProducts.rows.length} rows`);

    // 9. Delete Customer Addresses (2 rows)
    const delAddresses = await client.query(`
      DELETE FROM public.addresses 
      WHERE user_id != $1
      RETURNING id
    `, [adminUser.id]);
    console.log(`✓ Deleted addresses: ${delAddresses.rows.length} rows`);

    // 10. Delete Password Reset Tokens (0 rows)
    const delTokens = await client.query(`DELETE FROM public.password_reset_tokens RETURNING token`);
    console.log(`✓ Deleted password_reset_tokens: ${delTokens.rows.length} rows`);

    // 11. Delete all Non-Admin Profiles (12 rows: 5 customers, 1 delivery partner, 6 fishermen)
    const delProfiles = await client.query(`
      DELETE FROM public.profiles 
      WHERE id != $1 AND role != 'admin'
      RETURNING id, email, role, full_name
    `, [adminUser.id]);
    console.log(`✓ Deleted non-admin profiles: ${delProfiles.rows.length} rows:`);
    delProfiles.rows.forEach(p => {
      console.log(`   - Deleted [${p.role}] ${p.email} (${p.full_name})`);
    });

    // 12. Reset coupon usage count to 0
    await client.query(`UPDATE public.coupons SET used_count = 0`);
    console.log(`✓ Reset coupon used_count to 0 on all active coupons`);

    // 13. If any non-admin users in auth.users, remove them
    try {
      const delAuthUsers = await client.query(`
        DELETE FROM auth.users 
        WHERE email != 'admin@fishbasket.in'
        RETURNING id, email
      `);
      if (delAuthUsers.rows.length > 0) {
        console.log(`✓ Deleted auth.users: ${delAuthUsers.rows.length} non-admin accounts`);
      }
    } catch (e) {
      console.log(`   (Note: auth.users deletion skipped or handled via profiles: ${e.message})`);
    }

    await client.query('COMMIT');
    console.log('\n=== TRANSACTION COMMITTED SUCCESSFULLY ===\n');

    // POST-RESET AUDIT & VERIFICATION
    console.log('=== POST-RESET DATABASE VERIFICATION ===');

    const tablesToVerify = [
      'profiles',
      'orders',
      'order_items',
      'reviews',
      'addresses',
      'products',
      'product_variants',
      'product_preparation_options',
      'product_images',
      'categories',
      'delivery_zones',
      'delivery_slots',
      'coupons',
      'store_settings',
    ];

    for (const table of tablesToVerify) {
      const countRes = await client.query(`SELECT COUNT(*)::int as count FROM public."${table}"`);
      console.log(`   - ${table}: ${countRes.rows[0].count} rows remaining`);
    }

    // Verify Admin Profile remains intact
    const remainingProfiles = await client.query(`SELECT id, email, full_name, role, status FROM public.profiles`);
    console.log('\nRemaining Profiles in Database:');
    remainingProfiles.rows.forEach(p => {
      console.log(`   - [${p.id}] ${p.email} | Role: ${p.role} | Status: ${p.status} | Name: ${p.full_name}`);
    });

    if (remainingProfiles.rows.length === 1 && remainingProfiles.rows[0].role === 'admin') {
      console.log('\n✓ VERIFIED: Exactly 1 profile exists, which is the verified Administrator.');
    } else {
      console.warn('\n⚠ WARNING: Unexpected profile count after reset.');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR during reset! Transaction rolled back cleanly:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error('Execution failed:', e);
  process.exit(1);
});
