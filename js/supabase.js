// Supabase client — substitua SUPABASE_ANON_KEY pela sua chave anon/public
// Dashboard → Settings → API → Project API Keys → anon / public
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const SUPABASE_URL = 'https://vidqfwtlevrdgwwpxwsj.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_azaF6qKhNe9tuh7eSys10Q_6uGKFJGI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
})
