import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ error: 'supabase_not_configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '168', 10);
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from('funnel_events')
      .select('event, session_id, created_at, meta')
      .in('event', ['checkout_open', 'paid_success', 'checkout_cancelled'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const rows = data || [];
    const bySession = {};
    for (const r of rows) {
      const sid = r.session_id || 'no_session_id';
      if (!bySession[sid]) bySession[sid] = [];
      bySession[sid].push({ event: r.event, at: r.created_at, meta: r.meta });
    }

    const abandoned = Object.entries(bySession)
      .filter(([, evts]) => evts.some(e => e.event === 'checkout_open') && !evts.some(e => e.event === 'paid_success'))
      .map(([sid, evts]) => ({ session_id: sid, events: evts }));

    const paid = Object.entries(bySession)
      .filter(([, evts]) => evts.some(e => e.event === 'paid_success'))
      .map(([sid, evts]) => ({ session_id: sid, events: evts }));

    const totalPaid = rows.filter(r => r.event === 'paid_success').length;

    return Response.json({
      ok: true,
      window_hours: hours,
      total_checkout_open: rows.filter(r => r.event === 'checkout_open').length,
      total_paid: totalPaid,
      abandoned_sessions: abandoned.length,
      paid_sessions: paid.length,
      diagnosis: totalPaid === 0 ? 'All checkouts abandoned — verify Stripe webhook at /api/stripe/webhook (event: checkout.session.completed)' : 'ok',
      abandoned: abandoned.slice(0, 10),
      paid,
    });
  } catch (err) {
    return Response.json({ error: err?.message }, { status: 500 });
  }
}
