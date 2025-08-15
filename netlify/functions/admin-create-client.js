// netlify/functions/admin-create-client.js
const { supabaseAdmin } = require('./_supabase');

const INCLUDED = { basic: 600, pro: 1100, enterprise: 3600 };

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Simple server-side guard
    const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    if (!token || token !== process.env.ADMIN_API_TOKEN) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { email, password, orgName, plan, agentId, agentName } = body;

    if (!email || !password || !orgName || !plan || !agentId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
    }
    if (!INCLUDED[plan]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid plan' }) };
    }

    const supa = supabaseAdmin();

    // 1) Create Auth user
    const { data: created, error: createErr } = await supa.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created?.user?.id) {
      throw new Error(createErr?.message || 'Failed to create auth user');
    }
    const userId = created.user.id;

    // 2) Create org
    const { data: orgRow, error: orgErr } = await supa
      .from('orgs')
      .insert({ name: orgName })
      .select('id')
      .single();
    if (orgErr) throw new Error(orgErr.message);
    const orgId = orgRow.id;

    // 3) Membership (owner)
    const { error: memErr } = await supa
      .from('memberships')
      .insert({ org_id: orgId, user_id: userId, role: 'owner' });
    if (memErr) throw new Error(memErr.message);

    // 4) Subscription (pre-Stripe)
    const { error: subErr } = await supa.from('subscriptions').insert({
      org_id: orgId,
      plan,
      included_minutes: INCLUDED[plan],
      overage_rate_cents: 25,   // €0.25/min
      min_term_months: 5,
    });
    if (subErr) throw new Error(subErr.message);

    // 5) Upsert ElevenLabs agent and assign to org
    const { error: agentErr } = await supa.from('agents').upsert(
      {
        elevenlabs_agent_id: agentId,
        name: agentName || agentId,
        org_id: orgId,
        status: 'active',
      },
      { onConflict: 'elevenlabs_agent_id' }
    );
    if (agentErr) throw new Error(agentErr.message);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, orgId, userId }),
    };
  } catch (err) {
    console.error('admin-create-client error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Unknown error' }) };
  }
};
