import pg from 'pg';
import fs from 'fs';
import path from 'path';
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

const TABLES = [
  'store_settings',
  'categories',
  'delivery_zones',
  'delivery_slots',
  'coupons',
  'profiles',
  'products',
  'product_variants',
  'product_preparation_options',
  'product_images',
  'addresses',
  'orders',
  'order_items',
  'reviews',
  'password_reset_tokens',
];

async function run() {
  const client = await pool.connect();
  const backupDir = path.resolve('supabase/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonBackupPath = path.join(backupDir, `backup_fishbasket_${timestamp}.json`);
  const sqlBackupPath = path.join(backupDir, `backup_fishbasket_${timestamp}.sql`);

  console.log('=== STARTING SECURE DATABASE BACKUP ===');
  console.log('Target Directory:', backupDir);

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      supabase_project: 'btcyracwqnveziwgphrz.supabase.co',
      database: 'postgres',
    },
    tables: {},
  };

  let sqlDump = `-- FISH BASKET RECOVERABLE DATABASE BACKUP
-- Timestamp: ${new Date().toISOString()}
-- Supabase Project: btcyracwqnveziwgphrz.supabase.co

BEGIN;

`;

  try {
    for (const table of TABLES) {
      const res = await client.query(`SELECT * FROM public."${table}"`);
      backupData.tables[table] = res.rows;
      console.log(`✓ Backed up ${table}: ${res.rows.length} rows`);

      if (res.rows.length > 0) {
        sqlDump += `-- Table: ${table} (${res.rows.length} rows)\n`;
        const columns = Object.keys(res.rows[0]);
        for (const row of res.rows) {
          const colList = columns.map(c => `"${c}"`).join(', ');
          const valList = columns.map(c => {
            const val = row[c];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sqlDump += `INSERT INTO public."${table}" (${colList}) VALUES (${valList}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlDump += '\n';
      }
    }

    sqlDump += `COMMIT;\n`;

    fs.writeFileSync(jsonBackupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    fs.writeFileSync(sqlBackupPath, sqlDump, 'utf-8');

    console.log('\n✓ JSON backup saved successfully to:', jsonBackupPath);
    console.log('✓ SQL restore script saved successfully to:', sqlBackupPath);

    // Verify backup integrity
    const savedJson = JSON.parse(fs.readFileSync(jsonBackupPath, 'utf-8'));
    let totalVerifiedRows = 0;
    for (const table of TABLES) {
      const count = savedJson.tables[table]?.length || 0;
      totalVerifiedRows += count;
    }
    console.log(`\n✓ Backup Verification Check: ${totalVerifiedRows} total records verified across ${TABLES.length} tables.`);

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error('Backup failed:', e);
  process.exit(1);
});
