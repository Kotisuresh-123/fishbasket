import { Client } from 'pg';

async function testQueries() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Testing queries on Supabase Postgres...');

  // 1. Categories
  const catRes = await client.query('SELECT count(*) FROM categories');
  console.log('Categories count:', catRes.rows[0].count);

  // 2. Products
  const prodRes = await client.query('SELECT count(*) FROM products');
  console.log('Products count:', prodRes.rows[0].count);

  // 3. Profiles
  const profRes = await client.query('SELECT role, status, count(*) FROM profiles GROUP BY role, status');
  console.log('Profiles breakdown:', profRes.rows);

  // 4. Customers query with LEFT JOIN for orders
  const custRes = await client.query(`
    SELECT 
      p.id, p.full_name, p.email, p.phone, p.created_at,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_spend
    FROM profiles p
    LEFT JOIN orders o ON o.user_id = p.id
    WHERE p.role = 'customer'
    GROUP BY p.id, p.full_name, p.email, p.phone, p.created_at
    ORDER BY p.created_at DESC;
  `);
  console.log('Customers count:', custRes.rows.length);
  console.log('Customer details:', custRes.rows.map(c => ({ name: c.full_name, email: c.email, orders: c.order_count })));

  // 5. Orders
  const ordRes = await client.query('SELECT count(*) FROM orders');
  console.log('Orders count:', ordRes.rows[0].count);

  await client.end();
  console.log('All test queries passed successfully!');
}

testQueries().catch(console.error);
