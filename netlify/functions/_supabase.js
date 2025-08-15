// netlify/functions/_supabase.js
const { createClient } = require('@supabase/supabase-js');

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!url || !key) throw new Error('Missing Supabase env (URL or SERVICE_ROLE_KEY)');
  return createClient(url, key, { auth: { persistSession: false } });
}

module.exports = { supabaseAdmin };
