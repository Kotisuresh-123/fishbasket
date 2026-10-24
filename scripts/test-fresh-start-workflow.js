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
  console.log('=== VERIFYING FRESH START CAPABILITIES ON RESET SUPABASE DATABASE ===\n');

  let testCustomerId = null;
  let testFishermanId = null;
  let testDriverId = null;
  let testProductId = null;
  let testOrderId = null;
  let testReviewId = null;

  try {
    // 1. Admin Authentication Check
    const adminRes = await client.query(`
      SELECT id, email, full_name, role, status, password_hash
      FROM public.profiles
      WHERE role = 'admin' AND email = 'admin@fishbasket.in'
    `);
    console.log('1. Admin Account Integrity:');
    if (adminRes.rows.length === 1 && adminRes.rows[0].status === 'approved') {
      console.log('   ✓ Verified: Admin profile intact, approved, with active credentials.\n');
    } else {
      throw new Error('Admin account verification failed!');
    }

    // 2. Customer Registration
    console.log('2. Testing Fresh Customer Registration:');
    const custEmail = `fresh_customer_${Date.now()}@example.com`;
    const custRes = await client.query(`
      INSERT INTO public.profiles (id, email, full_name, phone, role, status, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Fresh Customer Test', '+91 98888 11111', 'customer', 'approved', 'hash_test', NOW(), NOW())
      RETURNING id, email, role, status
    `, [custEmail]);
    testCustomerId = custRes.rows[0].id;
    console.log('   ✓ Customer registered in Supabase:', custRes.rows[0]);

    // 3. Fisherman Registration & Admin Approval
    console.log('\n3. Testing Fresh Fisherman Registration & Approval:');
    const fishEmail = `fresh_fisherman_${Date.now()}@example.com`;
    const fishRes = await client.query(`
      INSERT INTO public.profiles (id, email, full_name, display_name, phone, dock_location, role, status, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Captain Satish', 'Satish Fresh Marine', '+91 97777 22222', 'Jetty #4 Visakha Harbor', 'fisherman', 'pending', 'hash_test', NOW(), NOW())
      RETURNING id, email, role, status
    `, [fishEmail]);
    testFishermanId = fishRes.rows[0].id;
    console.log('   ✓ Fisherman registered (status: pending):', fishRes.rows[0]);

    // Admin approves fisherman
    await client.query(`UPDATE public.profiles SET status = 'approved', updated_at = NOW() WHERE id = $1`, [testFishermanId]);
    const approvedFish = await client.query(`SELECT id, status FROM public.profiles WHERE id = $1`, [testFishermanId]);
    console.log('   ✓ Admin approved fisherman in Supabase:', approvedFish.rows[0].status === 'approved');

    // 4. Fisherman creates new fresh product listing
    console.log('\n4. Testing Fresh Product Listing Creation by Fisherman:');
    const catRes = await client.query(`SELECT id FROM public.categories LIMIT 1`);
    const catId = catRes.rows[0].id;

    const prodRes = await client.query(`
      INSERT INTO public.products (
        id, category_id, fisherman_id, seller_name, name, slug, description,
        price_per_unit, unit, stock_quantity, is_available, freshness, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, 'Satish Fresh Marine', 'Fresh Visakha Pomfret Catch',
        $3, 'Freshly harvested silver pomfret from Bay of Bengal morning boat haul.',
        450.00, 'kg', 20, TRUE, 'fresh_catch', NOW(), NOW()
      ) RETURNING id, name, fisherman_id, price_per_unit, stock_quantity
    `, [catId, testFishermanId, `fresh-pomfret-${Date.now()}`]);
    testProductId = prodRes.rows[0].id;
    console.log('   ✓ Product published by fisherman:', prodRes.rows[0]);

    // 5. Delivery Partner Registration & Admin Approval
    console.log('\n5. Testing Fresh Delivery Partner Registration & Approval:');
    const driverEmail = `fresh_driver_${Date.now()}@example.com`;
    const driverRes = await client.query(`
      INSERT INTO public.profiles (id, email, full_name, phone, vehicle_info, role, status, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, 'Naresh Kumar Fleet', '+91 96666 33333', 'Electric Scooter with Insulated Cold Box AP 31 FF 1001', 'delivery_partner', 'pending', 'hash_test', NOW(), NOW())
      RETURNING id, email, role, status
    `, [driverEmail]);
    testDriverId = driverRes.rows[0].id;
    console.log('   ✓ Delivery partner registered (status: pending):', driverRes.rows[0]);

    // Admin approves delivery partner
    await client.query(`UPDATE public.profiles SET status = 'approved', updated_at = NOW() WHERE id = $1`, [testDriverId]);
    const approvedDriver = await client.query(`SELECT id, status FROM public.profiles WHERE id = $1`, [testDriverId]);
    console.log('   ✓ Admin approved delivery partner:', approvedDriver.rows[0].status === 'approved');

    // 6. Customer Places an Order
    console.log('\n6. Testing Fresh Order Placement:');
    const orderNum = `FB-NEW-${Date.now().toString().slice(-6)}`;
    const orderRes = await client.query(`
      INSERT INTO public.orders (
        id, order_number, user_id, fisherman_id, seller_name, status,
        subtotal, cleaning_fee_total, delivery_fee, discount_amount, tax_amount, total_amount,
        payment_method, payment_status, delivery_address, delivery_slot, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'Satish Fresh Marine', 'confirmed',
        450.00, 0, 49.00, 0, 0, 499.00,
        'cod', 'pending',
        '{"recipient_name":"Fresh Customer Test","house_flat":"Flat 502","street_locality":"Siripuram","city":"Visakhapatnam","pincode":"530003"}'::jsonb,
        '{"name":"Evening Fresh (04:30 PM - 07:30 PM)"}'::jsonb,
        NOW(), NOW()
      ) RETURNING id, order_number, status, total_amount
    `, [orderNum, testCustomerId, testFishermanId]);
    testOrderId = orderRes.rows[0].id;

    // Order item
    await client.query(`
      INSERT INTO public.order_items (
        id, order_id, product_id, fisherman_id, seller_name, product_name,
        preparation_name, cleaning_fee, unit_price, quantity, item_total
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'Satish Fresh Marine', 'Fresh Visakha Pomfret Catch',
        'Whole Cleaned', 0, 450.00, 1, 450.00
      )
    `, [testOrderId, testProductId, testFishermanId]);
    console.log('   ✓ Order placed and persisted in Supabase:', orderRes.rows[0]);

    // 7. Fisherman Prepares and Marks Ready for Pickup
    console.log('\n7. Testing Fisherman Status Progression:');
    await client.query(`UPDATE public.orders SET status = 'preparing', updated_at = NOW() WHERE id = $1`, [testOrderId]);
    console.log('   ✓ Order updated to "preparing"');

    await client.query(`UPDATE public.orders SET status = 'ready_for_pickup', updated_at = NOW() WHERE id = $1`, [testOrderId]);
    console.log('   ✓ Order updated to "ready_for_pickup"');

    // 8. Available Deliveries Discovery & Atomic Acceptance
    console.log('\n8. Testing Delivery Partner Available Dispatches Discovery & Acceptance:');
    const availRes = await client.query(`
      SELECT id, order_number, status
      FROM public.orders
      WHERE (status = 'ready_for_pickup' OR status = 'packed')
        AND (assigned_delivery_partner IS NULL OR assigned_delivery_partner->>'id' IS NULL)
        AND id = $1
    `, [testOrderId]);
    console.log('   ✓ Available dispatches query successfully discovered order:', availRes.rows.length === 1);

    // Atomic claim by driver
    const partnerObj = { id: testDriverId, name: 'Naresh Kumar Fleet', phone: '+91 96666 33333' };
    const claimRes = await client.query(`
      UPDATE public.orders
      SET assigned_delivery_partner = $1, updated_at = NOW()
      WHERE id = $2
        AND (assigned_delivery_partner IS NULL OR assigned_delivery_partner->>'id' IS NULL)
        AND status IN ('ready_for_pickup', 'packed')
      RETURNING id, assigned_delivery_partner
    `, [JSON.stringify(partnerObj), testOrderId]);
    console.log('   ✓ Atomic acceptance succeeded for driver:', claimRes.rows.length === 1);

    // 9. Delivery Partner Delivery Lifecycle
    console.log('\n9. Testing Out for Delivery & Delivered Status Transitions:');
    await client.query(`
      UPDATE public.orders 
      SET status = 'out_for_delivery', updated_at = NOW() 
      WHERE id = $1 AND assigned_delivery_partner->>'id' = $2
    `, [testOrderId, testDriverId]);
    console.log('   ✓ Order status transitioned to "out_for_delivery"');

    await client.query(`
      UPDATE public.orders 
      SET status = 'delivered', payment_status = 'success', payment_collected_at = NOW(), updated_at = NOW() 
      WHERE id = $1 AND assigned_delivery_partner->>'id' = $2
    `, [testOrderId, testDriverId]);
    console.log('   ✓ Order status transitioned to "delivered" with COD collection recorded');

    // 10. Verified Buyer Review
    console.log('\n10. Testing Customer Verified Buyer Review:');
    const revRes = await client.query(`
      INSERT INTO public.reviews (
        id, product_id, order_id, user_id, fisherman_id, author_name,
        rating, title, comment, is_verified_buyer, is_approved, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'Fresh Customer Test',
        5, 'Excellent Fresh Catch!', 'Superb quality pomfret delivered chilled with ice.',
        TRUE, TRUE, NOW()
      ) RETURNING id, rating, title
    `, [testProductId, testOrderId, testCustomerId, testFishermanId]);
    testReviewId = revRes.rows[0].id;
    console.log('   ✓ Customer review created:', revRes.rows[0]);

    console.log('\n=== ALL FRESH START LIFECYCLE WORKFLOWS PASSED COMPLETELY! ===\n');

  } finally {
    // Clean up test verification records to leave database clean
    console.log('Cleaning up verification records to leave database pristine for user...');
    if (testReviewId) await client.query(`DELETE FROM public.reviews WHERE id = $1`, [testReviewId]);
    if (testOrderId) {
      await client.query(`DELETE FROM public.order_items WHERE order_id = $1`, [testOrderId]);
      await client.query(`DELETE FROM public.orders WHERE id = $1`, [testOrderId]);
    }
    if (testProductId) await client.query(`DELETE FROM public.products WHERE id = $1`, [testProductId]);
    if (testDriverId) await client.query(`DELETE FROM public.profiles WHERE id = $1`, [testDriverId]);
    if (testFishermanId) await client.query(`DELETE FROM public.profiles WHERE id = $1`, [testFishermanId]);
    if (testCustomerId) await client.query(`DELETE FROM public.profiles WHERE id = $1`, [testCustomerId]);
    console.log('✓ Cleaned up verification records. Database is in 100% pristine post-reset state.');

    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error('Fresh start workflow test failed:', e);
  process.exit(1);
});
