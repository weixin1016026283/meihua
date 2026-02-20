import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'invalid' }, { status: 400 });
    }
    await supabase.from('questions').insert({ question: question.trim() });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
