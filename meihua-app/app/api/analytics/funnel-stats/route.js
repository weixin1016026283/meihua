import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function median(nums) {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function pct(a, b) {
  if (!b) return 0;
  return Number(((a / b) * 100).toFixed(2));
}

const MIN_SESSION_DURATION_MS = 3000; // filter out <3s bot/noise sessions

function summarize(rows) {
  const counts = { session_start: 0, reading_done: 0, checkout_open: 0, paid_success: 0 };
  const bySession = new Map();

  for (const r of rows) {
    if (counts[r.event] !== undefined) counts[r.event] += 1;
    if (r.session_id) {
      const t = new Date(r.created_at).getTime();
      const item = bySession.get(r.session_id) || { start: t, end: t, hasPaid: false };
      item.start = Math.min(item.start, t);
      item.end = Math.max(item.end, t);
      if (r.event === 'paid_success') item.hasPaid = true;
      bySession.set(r.session_id, item);
    }
  }

  const sessionDurationsMin = [];
  const paidDurationsMin = [];
  for (const [, s] of bySession) {
    const durMs = s.end - s.start;
    // Filter <3s (bot/instant bounces) — they skew median to near-zero
    if (!isFinite(durMs) || durMs < MIN_SESSION_DURATION_MS) continue;
    const dur = durMs / 60000;
    sessionDurationsMin.push(dur);
    if (s.hasPaid) paidDurationsMin.push(dur);
  }

  const med = median(sessionDurationsMin);
  const medPaid = median(paidDurationsMin);

  return {
    counts,
    conversion: {
      reading_rate: pct(counts.reading_done, counts.session_start),
      checkout_rate: pct(counts.checkout_open, counts.reading_done),
      paid_rate_from_checkout: pct(counts.paid_success, counts.checkout_open),
      paid_rate_from_session: pct(counts.paid_success, counts.session_start),
    },
    median_session_minutes: med != null ? Number(med.toFixed(2)) : null,
    median_paid_session_minutes: medPaid != null ? Number(medPaid.toFixed(2)) : null,
    sessions_with_duration: sessionDurationsMin.length,
  };
}

export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const hours = Math.max(1, Math.min(24 * 30, parseInt(searchParams.get('hours') || '168', 10)));
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from('funnel_events')
      .select('event,session_id,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (error.code === '42P01' || msg.includes('funnel_events')) {
        return Response.json({ ok: false, error: 'funnel_table_missing', hint: 'run SQL migration for funnel_events' }, { status: 503 });
      }
      throw error;
    }

    const rows = data || [];
    const summary = summarize(rows);

    return Response.json({
      ok: true,
      window_hours: hours,
      since,
      total_rows: rows.length,
      ...summary,
    });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'funnel_stats_failed' }, { status: 500 });
  }
}
