// /app/api/x/search/route.js
// GET /api/x/search?q=tarot+reading&count=20
import { NextResponse } from 'next/server';

function verifyAuth(req) {
  return req.headers.get('Authorization') === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

export async function GET(request) {
  if (!verifyAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 100);
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 });

    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', q);
    url.searchParams.set('max_results', count.toString());
    url.searchParams.set('tweet.fields', 'author_id,created_at,public_metrics,conversation_id,reply_settings');
    url.searchParams.set('expansions', 'author_id');
    url.searchParams.set('user.fields', 'public_metrics,username,name');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
    });
    const data = await res.json();

    // Flatten author info onto tweets
    if (data.data && data.includes?.users) {
      const userMap = {};
      data.includes.users.forEach(u => { userMap[u.id] = u; });
      data.data = data.data.map(t => ({ ...t, author: userMap[t.author_id] || null, replyable: t.reply_settings === 'everyone' }));
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
