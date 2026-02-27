import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(request) {
  try {
    const { session_id, type, input_data, result_data, lang } = await request.json();
    if (!session_id || !type) {
      return Response.json({ error: 'session_id and type required' }, { status: 400 });
    }
    const { data, error } = await getSupabase()
      .from('readings')
      .insert({ session_id, type, input_data, result_data, lang: lang || 'en' })
      .select('id')
      .single();
    if (error) throw error;
    return Response.json({ ok: true, id: data.id });
  } catch (err) {
    console.error('save-reading error:', err?.message || err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
