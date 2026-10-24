import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btcyracwqnveziwgphrz.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y3lyYWN3cW52ZXppd2dwaHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MzMwNTYsImV4cCI6MjEwODQwOTA1Nn0.WrbsQLHSdZW8kzyFXziBxwQF5UdkOTGGmu9LoHI0w3M';

export const supabase = createClient(supabaseUrl, supabaseKey);
