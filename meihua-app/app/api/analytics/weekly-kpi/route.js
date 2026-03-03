import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function pct(a, b) {
  if (!b) return 0;
  return Number(((a / b) * 100).toFixed(2));
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [funnelRes, questionRes] = await Promise.all([
      supabase.from('funnel_events').select('event,session_id,created_at').gte('created_at', since7).limit(5000),
      supabase.from('questions').select('id,created_at').gte('created_at', since7).limit(5000),
    ]);

    const funnelRows = funnelRes.data || [];
    const qRows = questionRes.data || [];

    const c = { session_start: 0, reading_done: 0, checkout_open: 0, paid_success: 0 };
    for (const r of funnelRows) if (c[r.event] !== undefined) c[r.event] += 1;

    return Response.json({
      ok: true,
      kpi: 'paid_conversion_rate',
      window: '7d',
      exposure: c.session_start,
      clicks: c.reading_done,
      checkout_open: c.checkout_open,
      paid_success: c.paid_success,
      paid_rate: pct(c.paid_success, c.session_start),
      checkout_to_paid_rate: pct(c.paid_success, c.checkout_open),
      questions_7d: qRows.length,
      arpu: null,
      note: 'ARPU requires Stripe revenue data integration',
    });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'weekly_kpi_failed' }, { status: 500 });
  }
}
