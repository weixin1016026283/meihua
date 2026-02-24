import { createClient } from '@supabase/supabase-js';

// Browser client (singleton)
let browserClient = null;

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;
  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return browserClient;
}

// Server client (service role — use in API routes only)
export function getSupabaseServer() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
