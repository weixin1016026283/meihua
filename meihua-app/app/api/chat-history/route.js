import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// GET: Load chat history for a session
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const page_type = searchParams.get('page_type');
    if (!session_id || !page_type) {
      return Response.json({ error: 'session_id and page_type required' }, { status: 400 });
    }
    const { data, error } = await getSupabase()
      .from('chat_history')
      .select('role, content, created_at')
      .eq('session_id', session_id)
      .eq('page_type', page_type)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return Response.json({ messages: data || [] });
  } catch (err) {
    console.error('chat-history GET error:', err?.message || err);
    return Response.json({ messages: [] }, { status: 500 });
  }
}

// POST: Save a chat message
export async function POST(request) {
  try {
    const { session_id, page_type, role, content } = await request.json();
    if (!session_id || !page_type || !role || !content) {
      return Response.json({ error: 'All fields required' }, { status: 400 });
    }
    const { error } = await getSupabase()
      .from('chat_history')
      .insert({ session_id, page_type, role, content });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (err) {
    console.error('chat-history POST error:', err?.message || err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
