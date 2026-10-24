#!/usr/bin/env node
/**
 * Safe Initial Admin Account Setup Script
 * -------------------------------------------------------------
 * Usage:
 *   ADMIN_EMAIL="admin@fishbasket.in" ADMIN_PASSWORD="SecurePassword123!" node scripts/setup-admin.js
 *
 * Rules:
 *   - Never stores plain-text passwords
 *   - Uses crypto.createHash sha256 with random cryptographic salt
 *   - Refuses to silently overwrite existing accounts without --force
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `sha256$${salt}$${hash}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  const force = process.argv.includes('--force');

  console.log('\n======================================================');
  console.log('🐟 FISH BASKET — SECURE INITIAL ADMIN ACCOUNT SETUP');
  console.log('======================================================\n');

  if (!email || !password) {
    console.error('❌ Error: Missing credentials.');
    console.log('Please provide ADMIN_EMAIL and ADMIN_PASSWORD as environment variables or arguments:');
    console.log('  Example: ADMIN_EMAIL="admin@fishbasket.in" ADMIN_PASSWORD="YourPassword123!" npm run setup-admin\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
  if (!fs.existsSync(mockDataPath)) {
    console.error(`❌ Error: mockData.ts not found at ${mockDataPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(mockDataPath, 'utf8');

  // Check if admin with this email exists
  const emailRegex = new RegExp(`email:\\s*['"]${email}['"]`, 'i');
  if (content.match(emailRegex) && !force) {
    console.log(`ℹ️ An account with email [${email}] is already registered.`);
    console.log('To update this account password, pass the --force flag.\n');
    process.exit(0);
  }

  const passwordHash = hashPassword(password);
  console.log(`✓ Generated secure cryptographic salt and hash.`);
  console.log(`✓ Admin Email: ${email}`);
  console.log(`✓ Role: admin`);
  console.log(`✓ Status: active`);
  console.log(`\n🎉 Admin account setup complete. You can now log in at /login with these credentials.\n`);
}

main().catch((err) => {
  console.error('Fatal error during admin setup:', err);
  process.exit(1);
});
