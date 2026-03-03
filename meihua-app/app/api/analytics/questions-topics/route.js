import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

const TOPICS = [
  { key: 'business', kw: ['创业', '生意', '客户', '收入', '付费', '转化', 'business', 'startup', 'revenue', 'conversion', 'customer', 'pricing'] },
  { key: 'relationship', kw: ['感情', '关系', '复合', '对象', '婚姻', 'relationship', 'love', 'dating', 'partner', 'marriage'] },
  { key: 'career', kw: ['工作', '事业', '跳槽', 'offer', '面试', 'career', 'job', 'promotion', 'interview'] },
  { key: 'finance', kw: ['投资', '股票', '比特币', '基金', '财务', 'investment', 'stock', 'crypto', 'money'] },
];

function classify(q) {
  const s = String(q || '').toLowerCase();
  for (const t of TOPICS) {
    if (t.kw.some(k => s.includes(k.toLowerCase()))) return t.key;
  }
  return 'other';
}

export async function GET(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return Response.json({ ok: false, error: 'supabase_not_configured' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(30, parseInt(searchParams.get('days') || '7', 10)));
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from('questions')
      .select('question,created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) throw error;

    const rows = data || [];
    const counts = { business: 0, relationship: 0, career: 0, finance: 0, other: 0 };
    const samples = { business: [], relationship: [], career: [], finance: [], other: [] };

    for (const r of rows) {
      const c = classify(r.question);
      counts[c] += 1;
      if (samples[c].length < 5) samples[c].push(r.question);
    }

    return Response.json({ ok: true, window_days: days, since, total: rows.length, counts, samples });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'questions_topics_failed' }, { status: 500 });
  }
}
