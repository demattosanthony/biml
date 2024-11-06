import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASEURL!,
  process.env.SUPABASEKEY!
);

export default supabase;
