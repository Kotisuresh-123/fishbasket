import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is required.');
    process.exit(1);
  }
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Existing public tables count:', tables.length);
    console.log('Existing tables:', tables);

    try {
      const authRes = await client.query('SELECT count(*) FROM auth.users');
      console.log('Auth users count:', authRes.rows[0].count);
    } catch (e) {
      console.log('Could not query auth.users:', e.message);
    }

    for (const table of tables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`- ${table}: ${countRes.rows[0].count} rows`);
      } catch (e) {
        console.log(`- ${table}: error reading count (${e.message})`);
      }
    }
  } catch (err) {
    console.error('Database inspection error:', err);
  } finally {
    await client.end();
  }
}

main();
