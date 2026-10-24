import { Client } from 'pg';

async function seedData() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL for seeding.');

    // 1. Store settings
    console.log('Seeding store settings...');
    await client.query(`
      INSERT INTO store_settings (
        id, store_name, tagline, support_phone, support_email, support_address, 
        default_delivery_fee, free_delivery_threshold, tax_percentage, 
        is_accepting_orders, operational_hours
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Fish Basket',
        'Fresh Catch. Delivered Fresh.',
        '+91 89190 23456',
        'care@fishbasket.in',
        'Harbor Terminal 3, Coastal Road, Visakhapatnam, AP 530001',
        49.00,
        499.00,
        0.00,
        TRUE,
        '06:00 AM - 09:00 PM'
      ) ON CONFLICT (id) DO UPDATE SET 
        store_name = EXCLUDED.store_name,
        tagline = EXCLUDED.tagline;
    `);

    // 2. Delivery Zones
    console.log('Seeding delivery zones...');
    const zones = [
      ['530001', 'One Town / Old Post Office', 'Visakhapatnam', 49.00, 499.00, true, 2],
      ['530002', 'Daba Gardens / Jagadamba', 'Visakhapatnam', 49.00, 499.00, true, 2],
      ['530003', 'Beach Road / Siripuram', 'Visakhapatnam', 49.00, 499.00, true, 2],
      ['530016', 'Dwaraka Nagar / RTC Complex', 'Visakhapatnam', 49.00, 499.00, true, 2],
      ['530017', 'MVP Colony / Sector 1 to 9', 'Visakhapatnam', 49.00, 499.00, true, 2],
      ['530026', 'Gajuwaka / Auto Nagar', 'Visakhapatnam', 59.00, 599.00, true, 3],
      ['530044', 'Sheela Nagar / BHPV', 'Visakhapatnam', 59.00, 599.00, true, 3],
      ['530045', 'Rushikonda / IT SEZ', 'Visakhapatnam', 69.00, 699.00, true, 3],
      ['530048', 'Madhurawada / PM Palem', 'Visakhapatnam', 59.00, 599.00, true, 3],
    ];

    for (const z of zones) {
      await client.query(
        `
        INSERT INTO delivery_zones (pincode, area_name, city, delivery_charge, min_order_for_free_delivery, is_serviceable, estimated_delivery_hours)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (pincode) DO UPDATE SET area_name = EXCLUDED.area_name;
      `,
        z
      );
    }

    // 3. Delivery Slots
    console.log('Seeding delivery slots...');
    const slots = [
      ['b1000000-0000-0000-0000-000000000001', 'Early Morning (06:30 AM - 09:30 AM)', '06:30', '09:30', 40, true],
      ['b1000000-0000-0000-0000-000000000002', 'Mid-Morning (10:00 AM - 01:00 PM)', '10:00', '13:00', 50, true],
      ['b1000000-0000-0000-0000-000000000003', 'Evening Fresh (04:30 PM - 07:30 PM)', '16:30', '19:30', 45, true],
      ['b1000000-0000-0000-0000-000000000004', 'Dinner Special (07:30 PM - 09:30 PM)', '19:30', '21:30', 30, true],
    ];

    for (const s of slots) {
      await client.query(
        `
        INSERT INTO delivery_slots (id, name, start_time, end_time, max_orders_per_slot, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `,
        s
      );
    }

    // 4. Coupons
    console.log('Seeding coupons...');
    const coupons = [
      ['FRESH100', 'Flat ₹100 off on fresh catch orders above ₹699', 'fixed', 100.00, 699.00, 100.00, 84, true],
      ['FISH50', 'Flat ₹50 off on orders above ₹399', 'fixed', 50.00, 399.00, 50.00, 230, true],
      ['WELCOME20', '20% off up to ₹150 on your first fresh catch order', 'percentage', 20.00, 499.00, 150.00, 142, true],
    ];

    for (const c of coupons) {
      await client.query(
        `
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, used_count, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO NOTHING;
      `,
        c
      );
    }

    // 5. Categories
    console.log('Seeding categories...');
    const categories = [
      ['c1000000-0000-0000-0000-000000000001', 'Freshwater Fish', 'freshwater-fish', 'Naturally sweet-water river & lake catches sourced daily from Godavari and local sweet waters.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', 1],
      ['c1000000-0000-0000-0000-000000000002', 'Sea Fish', 'sea-fish', 'Fresh saltwater fish caught along the Bay of Bengal coastline and delivered chilled.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', 2],
      ['c1000000-0000-0000-0000-000000000003', 'Prawns & Shrimp', 'prawns', 'Succulent sea and coastal estuary prawns, available whole or peeled & deveined.', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80', 3],
      ['c1000000-0000-0000-0000-000000000004', 'Crabs', 'crabs', 'Live mangrove mud crabs and blue swimming sea crabs with rich, sweet meat.', 'https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=600&q=80', 4],
      ['c1000000-0000-0000-0000-000000000005', 'Lobster', 'lobster', 'Exquisite wild rock and sand lobsters for royal curries and butter-garlic grills.', 'https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&w=600&q=80', 5],
      ['c1000000-0000-0000-0000-000000000006', 'Squid & Cuttlefish', 'squid-cuttlefish', 'Tender calamari tubes and rings, cleaned with zero skin, ready for quick sautés and curries.', 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=600&q=80', 6],
      ['c1000000-0000-0000-0000-000000000007', 'Shellfish', 'shellfish', 'Fresh clams, black mussels, and coastal oysters thoroughly depurated for clean cooking.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80', 7],
      ['c1000000-0000-0000-0000-000000000008', 'Seafood Combos', 'seafood-combos', 'Carefully curated weekend curry & fry combo packs combining favorite fish and fresh prawns.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', 8],
    ];

    for (const cat of categories) {
      await client.query(
        `
        INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
      `,
        cat
      );
    }

    // 6. Profiles
    console.log('Seeding user profiles...');
    // Standard hash for 'FishBasket@2026'
    const defaultHash = '930aca4fab193334ea2f9f41c4a3076d11ac169e21c35cc3cc775cbf44b441fe';

    const profiles = [
      // 1. Suresh Kumar (Customer)
      ['11111111-1111-1111-1111-111111111111', 'customer@fishbasket.in', 'Suresh Kumar', '+91 98765 43210', 'customer', 'approved', null, null, defaultHash, '2026-02-10T10:00:00Z'],
      // 2. Admin
      ['22222222-2222-2222-2222-222222222222', 'admin@fishbasket.in', 'Fish Basket Admin', '+91 98765 43211', 'admin', 'approved', null, null, defaultHash, '2026-01-01T08:00:00Z'],
      // 3. Delivery Partner
      ['33333333-3333-3333-3333-333333333333', 'delivery@fishbasket.in', 'Ramesh Delivery Fleet', '+91 98765 43212', 'delivery_partner', 'approved', null, null, defaultHash, '2026-03-01T09:00:00Z'],
      // 4. Fisherman 1 (Approved)
      ['44444444-4444-4444-4444-444444444444', 'fisherman1@fishbasket.in', 'Ramana Rao', '+91 98765 43214', 'fisherman', 'approved', 'Captain Ramana (Bay Catch)', 'Visakhapatnam Harbor Jetty #3', defaultHash, '2026-02-01T06:00:00Z'],
      // 5. Fisherman 2 (Approved)
      ['55555555-5555-5555-5555-555555555555', 'fisherman2@fishbasket.in', 'Subba Reddy', '+91 98765 43215', 'fisherman', 'approved', 'Godavari Delta Fishermen', 'Kakinada Estuary Pier', defaultHash, '2026-02-05T07:30:00Z'],
      // 6. Fisherman 3 (Pending Approval — for admin approval testing!)
      ['66666666-6666-6666-6666-666666666666', 'fisherman_pending@fishbasket.in', 'Appala Naidu', '+91 98765 43216', 'fisherman', 'pending', 'Sagar Deep Fishery', 'Bheemili Beach Landing', defaultHash, '2026-10-22T08:15:00Z'],
      // 7. Customer: Anitha Reddy
      ['77777777-7777-7777-7777-777777777777', 'anitha.reddy@gmail.com', 'Anitha Reddy', '+91 98480 12345', 'customer', 'approved', null, null, defaultHash, '2026-03-15T11:20:00Z'],
      // 8. Customer: K. Venkat Rao
      ['88888888-8888-8888-8888-888888888888', 'k.venkat@yahoo.com', 'K. Venkat Rao', '+91 94401 67890', 'customer', 'approved', null, null, defaultHash, '2026-04-02T14:45:00Z'],
      // 9. Customer: Priya Sharma (Registered customer with 0 orders!)
      ['99999999-9999-9999-9999-999999999999', 'priya.sharma@outlook.com', 'Priya Sharma', '+91 99887 54321', 'customer', 'approved', null, null, defaultHash, '2026-10-24T09:00:00Z'],
    ];

    for (const p of profiles) {
      await client.query(
        `
        INSERT INTO profiles (id, email, full_name, phone, role, status, display_name, dock_location, password_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          status = EXCLUDED.status,
          display_name = EXCLUDED.display_name,
          dock_location = EXCLUDED.dock_location;
      `,
        p
      );
    }

    // 7. Addresses
    console.log('Seeding customer addresses...');
    await client.query(`
      INSERT INTO addresses (id, user_id, label, recipient_name, phone, house_flat, street_locality, landmark, city, state, pincode, is_default, delivery_instructions)
      VALUES 
        ('a1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Home', 'Suresh Kumar', '+91 98765 43210', 'Flat 402, Sea Pearl Apartments', 'Pandurangapuram, Beach Road', 'Near Submarine Museum', 'Visakhapatnam', 'Andhra Pradesh', '530003', true, 'Ring bell and leave cold gel pack with security if unavailable.'),
        ('a1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Work', 'Suresh Kumar', '+91 98765 43210', 'Suite 5B, IT Tower', 'Rushikonda Technology Park', 'Hill 2 Main Gate', 'Visakhapatnam', 'Andhra Pradesh', '530045', false, 'Deliver to reception desk.')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 8. Products
    console.log('Seeding products...');
    const products = [
      [
        'd1000000-0000-0000-0000-000000000001',
        'c1000000-0000-0000-0000-000000000001',
        '55555555-5555-5555-5555-555555555555', // Godavari Delta Fishermen
        'Godavari Delta Fishermen',
        'Rohu Fish (Bengali / Telugu Cut)',
        'rohu-fish',
        'Labeo rohita',
        'Godavari Freshwaters',
        'The indisputable king of freshwater dining! Sweet and tender river carp, ideal for mustard gravies, spicy pulusu, and classic home curries.',
        280.00,
        'kg',
        249.00,
        'fresh_catch',
        45.0,
        1.0,
        true,
        true,
        true,
        'Gross: 1000g - 1200g',
        'Net Cleaned: 700g - 750g',
        15,
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        4.8,
        42,
      ],
      [
        'd1000000-0000-0000-0000-000000000002',
        'c1000000-0000-0000-0000-000000000001',
        '55555555-5555-5555-5555-555555555555',
        'Godavari Delta Fishermen',
        'Katla Fish (River Carp)',
        'katla-fish',
        'Gibelion catla',
        'Krishna Basin',
        'Large river carp with juicy, thick steaks. Especially famous for flavorful head curries (Muri Ghanto) and rich weekend meals.',
        320.00,
        'kg',
        289.00,
        'fresh_catch',
        35.0,
        1.0,
        true,
        false,
        true,
        'Gross: 1500g',
        'Net Cleaned: 1050g - 1100g',
        15,
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        4.7,
        28,
      ],
      [
        'd1000000-0000-0000-0000-000000000003',
        'c1000000-0000-0000-0000-000000000002',
        '44444444-4444-4444-4444-444444444444', // Captain Ramana
        'Captain Ramana (Bay Catch)',
        'Indian White Pomfret (Paplet / Vellai Vavval)',
        'white-pomfret',
        'Pampus argenteus',
        'Bay of Bengal Deep Sea',
        'The king of delicate seafood! Soft, silky white flesh with subtle buttery sweetness. Highly sought after for tawa fry, rechado, and steam.',
        890.00,
        'kg',
        799.00,
        'fresh_catch',
        25.0,
        0.5,
        true,
        true,
        true,
        'Gross: 500g (2-3 fish)',
        'Net Cleaned: 400g - 420g',
        10,
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        4.9,
        96,
      ],
      [
        'd1000000-0000-0000-0000-000000000004',
        'c1000000-0000-0000-0000-000000000002',
        '44444444-4444-4444-4444-444444444444',
        'Captain Ramana (Bay Catch)',
        'Seer Fish / Surmai (King Mackerel)',
        'seer-fish-surmai',
        'Scomberomorus commerson',
        'Visakhapatnam Deep Harbor',
        'Prized for its firm, single-bone meat and unforgettable rich taste. Cut into thick, round steaks perfect for pan-fried crispy rava fry or sour fish curry.',
        980.00,
        'kg',
        899.00,
        'fresh_catch',
        30.0,
        0.5,
        true,
        true,
        true,
        'Gross: 1000g',
        'Net Cleaned: 800g (Steaks)',
        15,
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        4.9,
        154,
      ],
      [
        'd1000000-0000-0000-0000-000000000007',
        'c1000000-0000-0000-0000-000000000003',
        '44444444-4444-4444-4444-444444444444',
        'Captain Ramana (Bay Catch)',
        'Jumbo Tiger Prawns (Fresh Catch)',
        'tiger-prawns',
        'Penaeus monodon',
        'Pulicat Estuary & Sea',
        'Distinct black stripes, crisp crunch, and naturally sweet meat. Fantastic for butter garlic toss, biryanis, and tandoori skewers.',
        750.00,
        '500g',
        680.00,
        'fresh_catch',
        40.0,
        1.0,
        true,
        true,
        true,
        'Gross: 500g (10-15 pcs)',
        'Net Peeled: 320g - 350g',
        15,
        'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
        4.8,
        112,
      ],
      [
        'd1000000-0000-0000-0000-000000000009',
        'c1000000-0000-0000-0000-000000000004',
        '55555555-5555-5555-5555-555555555555',
        'Godavari Delta Fishermen',
        'Live Mangrove Mud Crab (Large)',
        'mud-crab',
        'Scylla serrata',
        'Godavari Mangrove Creeks',
        'Plump, sweet crab meat encased in hard claws. Unbeatable depth in pepper masala crab roast and traditional Andhra crab iguru.',
        850.00,
        'kg',
        799.00,
        'fresh_catch',
        20.0,
        1.0,
        true,
        true,
        false,
        'Gross: 1000g (2-3 crabs)',
        'Net Cleaned: 600g - 650g',
        20,
        'https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=800&q=80',
        4.7,
        45,
      ],
      [
        'd1000000-0000-0000-0000-000000000011',
        'c1000000-0000-0000-0000-000000000006',
        '44444444-4444-4444-4444-444444444444',
        'Captain Ramana (Bay Catch)',
        'Fresh Calamari Squid Rings / Tubes',
        'fresh-squid',
        'Uroteuthis duvaucelii',
        'Visakhapatnam Shoreline',
        'Mild oceanic sweetness with pleasant chewy snap when cooked fast. Skin peeled and ink sack removed; pre-cut into ready-to-cook rings.',
        480.00,
        '500g',
        420.00,
        'fresh_catch',
        30.0,
        1.0,
        true,
        false,
        false,
        'Gross: 700g',
        'Net Cleaned: 500g (Rings)',
        15,
        'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=800&q=80',
        4.6,
        34,
      ],
      [
        'd1000000-0000-0000-0000-000000000013',
        'c1000000-0000-0000-0000-000000000008',
        '55555555-5555-5555-5555-555555555555',
        'Godavari Delta Fishermen',
        'Family Weekend Feast (Rohu Cut + White Prawns)',
        'family-weekend-combo',
        'Combo Pack',
        'Coastal Sourcing',
        'The ultimate Sunday family meal pack! Includes 500g Bengali Curry Cut Rohu plus 350g Peeled White Prawns at a special combo discount.',
        650.00,
        'pack',
        549.00,
        'fresh_catch',
        25.0,
        1.0,
        true,
        true,
        true,
        'Gross: 1200g combined',
        'Net: 850g Cleaned Ready to Cook',
        15,
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        4.9,
        167,
      ],
    ];

    for (const prod of products) {
      await client.query(
        `
        INSERT INTO products (
          id, category_id, fisherman_id, seller_name, name, slug, variety_species, origin_source,
          description, price_per_unit, unit, discount_price, freshness, stock_quantity,
          min_order_qty, is_available, is_featured, is_bestseller, gross_weight_text,
          net_yield_text, estimated_prep_minutes, image_url, rating, review_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24
        )
        ON CONFLICT (slug) DO UPDATE SET
          price_per_unit = EXCLUDED.price_per_unit,
          discount_price = EXCLUDED.discount_price,
          stock_quantity = EXCLUDED.stock_quantity,
          seller_name = EXCLUDED.seller_name;
      `,
        prod
      );

      // Add default variant
      await client.query(
        `
        INSERT INTO product_variants (product_id, variant_name, weight_grams, price, discount_price, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6);
      `,
        [
          prod[0],
          '1 ' + prod[10] + ' Pack',
          prod[10] === 'kg' ? 1000 : 500,
          prod[9],
          prod[11],
          prod[13],
        ]
      );

      // Add default prep option
      await client.query(
        `
        INSERT INTO product_preparation_options (product_id, name, description, extra_price, est_weight_loss_percent, is_default)
        VALUES ($1, 'Curry Cut', 'Gutted, descaled and cut into pieces for curry.', 0.00, 25.00, true);
      `,
        [prod[0]]
      );
    }

    // 9. Orders
    console.log('Seeding initial orders...');
    const initialOrders = [
      {
        id: 'e1000000-0000-0000-0000-000000000001',
        order_number: 'FB-20261023-0841',
        user_id: '11111111-1111-1111-1111-111111111111', // Suresh Kumar
        fisherman_id: '44444444-4444-4444-4444-444444444444', // Captain Ramana
        seller_name: 'Captain Ramana (Bay Catch)',
        status: 'out_for_delivery',
        subtotal: 1579.00,
        cleaning_fee_total: 20.00,
        delivery_fee: 0.00,
        discount_amount: 100.00,
        tax_amount: 0.00,
        total_amount: 1499.00,
        coupon_code: 'FRESH100',
        payment_method: 'cod',
        payment_status: 'pending',
        delivery_address: {
          recipient_name: 'Suresh Kumar',
          phone: '+91 98765 43210',
          house_flat: 'Flat 402, Sea Pearl Apartments',
          street_locality: 'Pandurangapuram, Beach Road',
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          pincode: '530003',
        },
        delivery_slot: {
          name: 'Morning Fresh (06:30 AM - 09:30 AM)',
          start_time: '06:30',
          end_time: '09:30',
        },
        delivery_notes: 'Leave chilled gel box with security if door unanswered.',
        assigned_delivery_partner: {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Ramesh Delivery Fleet',
          phone: '+91 98765 43212',
        },
        items: [
          {
            product_id: 'd1000000-0000-0000-0000-000000000004',
            fisherman_id: '44444444-4444-4444-4444-444444444444',
            seller_name: 'Captain Ramana (Bay Catch)',
            product_name: 'Seer Fish / Surmai (King Mackerel)',
            product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            preparation_name: 'Curry Cut',
            cleaning_fee: 0,
            unit_price: 899.00,
            quantity: 1,
            item_total: 899.00,
          },
          {
            product_id: 'd1000000-0000-0000-0000-000000000007',
            fisherman_id: '44444444-4444-4444-4444-444444444444',
            seller_name: 'Captain Ramana (Bay Catch)',
            product_name: 'Jumbo Tiger Prawns (Fresh Catch)',
            product_image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
            preparation_name: 'Peeled & Deveined',
            cleaning_fee: 20.00,
            unit_price: 680.00,
            quantity: 1,
            item_total: 700.00,
          },
        ],
      },
      {
        id: 'e1000000-0000-0000-0000-000000000002',
        order_number: 'FB-20261021-0419',
        user_id: '11111111-1111-1111-1111-111111111111', // Suresh Kumar
        fisherman_id: '55555555-5555-5555-5555-555555555555', // Godavari Delta
        seller_name: 'Godavari Delta Fishermen',
        status: 'delivered',
        subtotal: 549.00,
        cleaning_fee_total: 0.00,
        delivery_fee: 0.00,
        discount_amount: 50.00,
        tax_amount: 0.00,
        total_amount: 499.00,
        coupon_code: 'FISH50',
        payment_method: 'cod',
        payment_status: 'success',
        delivery_address: {
          recipient_name: 'Suresh Kumar',
          phone: '+91 98765 43210',
          house_flat: 'Flat 402, Sea Pearl Apartments',
          street_locality: 'Pandurangapuram, Beach Road',
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          pincode: '530003',
        },
        delivery_slot: {
          name: 'Evening Fresh (04:30 PM - 07:30 PM)',
          start_time: '16:30',
          end_time: '19:30',
        },
        delivery_notes: 'Ring doorbell.',
        assigned_delivery_partner: {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Ramesh Delivery Fleet',
          phone: '+91 98765 43212',
        },
        items: [
          {
            product_id: 'd1000000-0000-0000-0000-000000000001',
            fisherman_id: '55555555-5555-5555-5555-555555555555',
            seller_name: 'Godavari Delta Fishermen',
            product_name: 'Rohu Fish (Bengali / Telugu Cut)',
            product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            preparation_name: 'Curry Cut',
            cleaning_fee: 0,
            unit_price: 249.00,
            quantity: 2,
            item_total: 498.00,
          },
        ],
      },
      {
        id: 'e1000000-0000-0000-0000-000000000003',
        order_number: 'FB-20261022-0912',
        user_id: '77777777-7777-7777-7777-777777777777', // Anitha Reddy
        fisherman_id: '44444444-4444-4444-4444-444444444444',
        seller_name: 'Captain Ramana (Bay Catch)',
        status: 'preparing',
        subtotal: 799.00,
        cleaning_fee_total: 0.00,
        delivery_fee: 0.00,
        discount_amount: 0.00,
        tax_amount: 0.00,
        total_amount: 799.00,
        payment_method: 'cod',
        payment_status: 'pending',
        delivery_address: {
          recipient_name: 'Anitha Reddy',
          phone: '+91 98480 12345',
          house_flat: 'Plot 12, Sector 4',
          street_locality: 'MVP Colony',
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          pincode: '530017',
        },
        delivery_slot: {
          name: 'Mid-Morning (10:00 AM - 01:00 PM)',
          start_time: '10:00',
          end_time: '13:00',
        },
        items: [
          {
            product_id: 'd1000000-0000-0000-0000-000000000003',
            fisherman_id: '44444444-4444-4444-4444-444444444444',
            seller_name: 'Captain Ramana (Bay Catch)',
            product_name: 'Indian White Pomfret (Paplet / Vellai Vavval)',
            product_image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
            preparation_name: 'Whole Cleaned',
            cleaning_fee: 0,
            unit_price: 799.00,
            quantity: 1,
            item_total: 799.00,
          },
        ],
      },
    ];

    for (const ord of initialOrders) {
      await client.query(
        `
        INSERT INTO orders (
          id, order_number, user_id, fisherman_id, seller_name, status,
          subtotal, cleaning_fee_total, delivery_fee, discount_amount, tax_amount, total_amount,
          coupon_code, payment_method, payment_status, delivery_address, delivery_slot,
          delivery_notes, assigned_delivery_partner
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19
        )
        ON CONFLICT (order_number) DO UPDATE SET status = EXCLUDED.status;
      `,
        [
          ord.id,
          ord.order_number,
          ord.user_id,
          ord.fisherman_id,
          ord.seller_name,
          ord.status,
          ord.subtotal,
          ord.cleaning_fee_total,
          ord.delivery_fee,
          ord.discount_amount,
          ord.tax_amount,
          ord.total_amount,
          ord.coupon_code || null,
          ord.payment_method,
          ord.payment_status,
          JSON.stringify(ord.delivery_address),
          JSON.stringify(ord.delivery_slot),
          ord.delivery_notes || null,
          ord.assigned_delivery_partner ? JSON.stringify(ord.assigned_delivery_partner) : null,
        ]
      );

      // Order items
      for (const it of ord.items) {
        await client.query(
          `
          INSERT INTO order_items (
            order_id, product_id, fisherman_id, seller_name, product_name,
            product_image, preparation_name, cleaning_fee, unit_price, quantity, item_total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT DO NOTHING;
        `,
          [
            ord.id,
            it.product_id,
            it.fisherman_id,
            it.seller_name,
            it.product_name,
            it.product_image,
            it.preparation_name,
            it.cleaning_fee,
            it.unit_price,
            it.quantity,
            it.item_total,
          ]
        );
      }
    }

    // 10. Reviews
    console.log('Seeding reviews...');
    const reviews = [
      [
        'd1000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'e1000000-0000-0000-0000-000000000002',
        '55555555-5555-5555-5555-555555555555',
        'Suresh Kumar',
        5,
        'Super fresh Rohu from Godavari Delta!',
        'Delivered chilled with gel ice packs. Absolutely clean curry cut with zero fishy odor. Cooked the same afternoon and taste was sweet and tender.',
      ],
      [
        'd1000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111',
        'e1000000-0000-0000-0000-000000000001',
        '44444444-4444-4444-4444-444444444444',
        'Dr. Ananya Rao',
        5,
        'Top notch Surmai fry slices from Captain Ramana',
        'The slices were uniform, firm and single-bone. Made spicy rava fry for Sunday lunch. Highly recommend Fish Basket!',
      ],
      [
        'd1000000-0000-0000-0000-000000000007',
        '11111111-1111-1111-1111-111111111111',
        'e1000000-0000-0000-0000-000000000001',
        '44444444-4444-4444-4444-444444444444',
        'K. Venkat',
        5,
        'Huge juicy prawns',
        'Peeled and deveined properly. Saved 30 mins of prep time in the kitchen. Very juicy when sauteed in garlic butter.',
      ],
    ];

    for (const r of reviews) {
      await client.query(
        `
        INSERT INTO reviews (product_id, user_id, order_id, fisherman_id, author_name, rating, title, comment, is_verified_buyer, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
        ON CONFLICT DO NOTHING;
      `,
        r
      );
    }

    // Notify PostgREST to reload schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✓ Seed data completed and PostgREST reload notified successfully.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();
