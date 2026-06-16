import { createClient } from "@supabase/supabase-js";

// A second, SESSION-LESS Supabase client used only to create login accounts
// for partners / team members from the admin UI.
//
// Why: supabase.auth.signUp() signs in as the newly created user and would
// replace the admin's session. With persistSession:false this client never
// writes to localStorage, so the admin stays logged in on the main client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

export const signupClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storageKey: "xpod-signup-client", // distinct key avoids GoTrue instance clash
  },
});
