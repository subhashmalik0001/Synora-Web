import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("Supabase credentials missing. Some backend features may not work.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Helper to get user profile from Supabase Auth
 */
export async function getSupabaseUser(accessToken: string) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error) throw error;
    return user;
}
