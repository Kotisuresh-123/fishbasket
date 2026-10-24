import { Client } from 'pg';

async function main() {
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
    console.log('Connected to Supabase PostgreSQL database.');

    const res = await client.query(
      `SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
    );
    console.log('Current Realtime tables:', res.rows.map((r) => r.tablename));

    const currentTables = res.rows.map((r) => r.tablename);
    if (!currentTables.includes('orders')) {
      console.log('Adding orders table to supabase_realtime publication...');
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE orders;`);
      console.log('✓ Added orders to supabase_realtime publication.');
    }
    if (!currentTables.includes('profiles')) {
      console.log('Adding profiles table to supabase_realtime publication...');
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE profiles;`);
      console.log('✓ Added profiles to supabase_realtime publication.');
    }

    const updated = await client.query(
      `SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
    );
    console.log('Updated Realtime tables:', updated.rows.map((r) => r.tablename));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
