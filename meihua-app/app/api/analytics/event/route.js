import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

const ALLOWED_EVENTS = new Set(['session_start', 'reading_done', 'checkout_open', 'paid_success']);

export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const body = await request.json();
    const event = String(body?.event || '').trim();
    if (!ALLOWED_EVENTS.has(event)) return Response.json({ ok: false, error: 'invalid_event' }, { status: 400 });

    const session_id = body?.session_id ? String(body.session_id) : null;
    const page = body?.page ? String(body.page) : null;
    const source = body?.source ? String(body.source) : null;
    const lang = body?.lang ? String(body.lang) : null;
    const meta = body?.meta && typeof body.meta === 'object' ? body.meta : {};

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;

    const { error } = await supabase.from('funnel_events').insert({
      event,
      session_id,
      page,
      source,
      lang,
      ip,
      meta,
    });

    if (error) {
      const msg = String(error.message || '');
      if (error.code === '42P01' || msg.includes('funnel_events')) {
        return Response.json({ ok: false, error: 'funnel_table_missing', hint: 'Run SQL migration for funnel_events' }, { status: 503 });
      }
      throw error;
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'event_insert_failed' }, { status: 500 });
  }
}
