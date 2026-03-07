// ===== Supabase Configuration (Shared) =====
const SUPABASE_URL = "https://fgvgcvezvztjidsrouyx.supabase.co";
const SUPABASE_KEY = "sb_publishable_aTlqNyccQYzgiaeIstjr7g_s6F6hMob";

// Initialize Supabase client once the library is loaded
function initializeSupabase() {
    if (window.supabaseClient) return; // Already initialized

    if (window.supabase && window.supabase.createClient) {
        const { createClient } = window.supabase;
        window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Supabase initialized");
    } else {
        console.warn("⚠️ Supabase library not ready yet");
    }
}

function getSupabaseClient() {
    // Try to initialize if not done yet
    if (!window.supabaseClient) {
        initializeSupabase();
    }
    return window.supabaseClient || null;
}

// Initialize as soon as this script loads
initializeSupabase();
