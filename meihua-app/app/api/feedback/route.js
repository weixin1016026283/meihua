import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function isMissingTableError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01' ||
    msg.includes('public.feedback') ||
    msg.includes('relation') && msg.includes('feedback') ||
    msg.includes('does not exist') && msg.includes('feedback') ||
    msg.includes('could not find the table') && msg.includes('feedback')
  );
}

function tableMissingResponse() {
  return Response.json(
    {
      ok: false,
      error: 'feedback_table_missing',
      hint: 'Run SQL migration to create public.feedback table',
      health: 'degraded',
    },
    { status: 503 }
  );
}

export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

    if (action === 'negative') {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('sentiment', 'negative')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        if (isMissingTableError(error)) return tableMissingResponse();
        throw error;
      }
      return Response.json({ ok: true, items: data || [] });
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('sentiment,rating,created_at')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      if (isMissingTableError(error)) return tableMissingResponse();
      throw error;
    }

    const rows = data || [];
    const total = rows.length;
    const positive = rows.filter(r => r.sentiment === 'positive').length;
    const negative = rows.filter(r => r.sentiment === 'negative').length;
    const neutral = rows.filter(r => !r.sentiment || r.sentiment === 'neutral').length;
    const ratings = rows.filter(r => typeof r.rating === 'number').map(r => r.rating);
    const avgRating = ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : null;

    return Response.json({
      ok: true,
      total,
      positive,
      negative,
      neutral,
      positiveRate: total ? Number((positive / total).toFixed(4)) : 0,
      avgRating,
      health: 'ok',
    });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'feedback_query_failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const body = await request.json();
    const sentiment = typeof body.sentiment === 'string' ? body.sentiment : 'neutral';
    const rating = typeof body.rating === 'number' ? body.rating : null;
    const message = typeof body.message === 'string' ? body.message.trim() : null;
    const source = typeof body.source === 'string' ? body.source : 'web';

    const { error } = await supabase.from('feedback').insert({ sentiment, rating, message, source });
    if (error) {
      if (isMissingTableError(error)) return tableMissingResponse();
      throw error;
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'feedback_insert_failed' }, { status: 500 });
  }
}
