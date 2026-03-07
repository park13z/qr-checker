// ===== Supabase Configuration (Shared) =====
const SUPABASE_URL = "https://fgvgcvezvztjidsrouyx.supabase.co";
const SUPABASE_KEY = "sb_publishable_aTlqNyccQYzgiaeIstjr7g_s6F6hMob";

function getSupabaseClient() {
    // Initialize Supabase client if not already done
    if (!window.supabaseClient && window.supabase && window.supabase.createClient) {
        const { createClient } = window.supabase;
        window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return window.supabaseClient || null;
}
