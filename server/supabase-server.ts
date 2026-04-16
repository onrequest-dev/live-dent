import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Supabase URL and SERVICE ROLE must be provided.');
}
export  const supabase_server = createClient(supabaseUrl, supabaseServiceRole);