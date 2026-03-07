// ===== Supabase Configuration (Shared) =====
const SUPABASE_URL = "https://fgvgcvezvztjidsrouyx.supabase.co";
const SUPABASE_KEY = "sb_publishable_aTlqNyccQYzgiaeIstjr7g_s6F6hMob";

// Create Supabase client only once
let supabase = null;

function getSupabaseClient() {
    if (!supabase && window.supabase) {
        const { createClient } = window.supabase;
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabase;
}
