let supabase = null;

if (import.meta.env.VITE_USE_SUPABASE === "true") {
  const { createClient } = await import("@supabase/supabase-js");

  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export { supabase };