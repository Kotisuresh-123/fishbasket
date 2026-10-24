import { createClient } from '@supabase/supabase-js';

async function testSupabase() {
  const url = 'https://btcyracwqnveziwgphrz.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y3lyYWN3cW52ZXppd2dwaHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MzMwNTYsImV4cCI6MjEwODQwOTA1Nn0.WrbsQLHSdZW8kzyFXziBxwQF5UdkOTGGmu9LoHI0w3M';
  const pubKey = 'sb_publishable_MpwzLJ2OP4I4TPtjmmOeEA_6TDK4xxB';

  console.log('Testing with legacy anonKey...');
  const supabase = createClient(url, anonKey);

  const { data: catData, error: catErr } = await supabase.from('categories').select('*');
  console.log('Categories count:', catData?.length, 'error:', catErr);

  const { data: prodData, error: prodErr } = await supabase.from('products').select('*');
  console.log('Products count:', prodData?.length, 'error:', prodErr);

  const { data: profData, error: profErr } = await supabase.from('profiles').select('id, email, full_name, role, status');
  console.log('Profiles count:', profData?.length, 'error:', profErr);

  console.log('\nTesting with publishableKey...');
  const supabasePub = createClient(url, pubKey);
  const { data: pubCatData, error: pubCatErr } = await supabasePub.from('categories').select('*');
  console.log('Publishable Key Categories count:', pubCatData?.length, 'error:', pubCatErr);
}

testSupabase().catch(console.error);
