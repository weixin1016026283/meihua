import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

// Skip obvious test/noise entries
function isTestNoise(question, ip) {
  if (!question || question.length < 3) return true;
  if (/^x+$/i.test(question)) return true;
  if (/^test$/i.test(question.trim())) return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  return false;
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const body = await request.json();
    const { question, session_id } = body;
    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'invalid' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const trimmed = question.trim();
    if (isTestNoise(trimmed, ip)) {
      return Response.json({ ok: true, skipped: true });
    }

    await supabase.from('questions').insert({
      question: trimmed,
      ip,
      session_id: session_id || null,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, Math.min(200, parseInt(searchParams.get('limit') || '50', 10)));
    const action = searchParams.get('action') || 'recent';

    if (action === 'stats') {
      const { data, error } = await supabase
        .from('questions')
        .select('question,created_at,ip')
        .order('created_at', { ascending: false })
        .limit(2000);
      if (error) throw error;

      const rows = (data || []).filter(r => !isTestNoise(r.question, r.ip));
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const in24h = rows.filter(r => new Date(r.created_at).getTime() >= dayAgo).length;
      const in7d = rows.filter(r => new Date(r.created_at).getTime() >= weekAgo).length;

      return Response.json({ ok: true, total: rows.length, last24h: in24h, last7d: in7d });
    }

    const { data, error } = await supabase
      .from('questions')
      .select('question,created_at,ip,session_id')
      .order('created_at', { ascending: false })
      .limit(limit * 3);
    if (error) throw error;

    const items = (data || [])
      .filter(r => !isTestNoise(r.question, r.ip))
      .slice(0, limit);

    return Response.json({ ok: true, items });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'query_failed' }, { status: 500 });
  }
}
