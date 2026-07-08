import { createClient } from "@supabase/supabase-js";

// Używaj tylko server-side (service role omija RLS)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
