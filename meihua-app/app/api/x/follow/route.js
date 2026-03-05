import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyAuth(req) {
  return req.headers.get('Authorization') === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

function oauthHeader(method, url, extra = {}) {
  const params = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
    ...extra,
  };

  const paramStr = Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const base = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
  const key = `${encodeURIComponent(process.env.X_API_SECRET)}&${encodeURIComponent(process.env.X_ACCESS_TOKEN_SECRET)}`;
  params.oauth_signature = crypto.createHmac('sha1', key).update(base).digest('base64');

  return 'OAuth ' + Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`).join(', ');
}

export async function POST(request) {
  if (!verifyAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { user_id, screen_name } = await request.json();
    if (!user_id && !screen_name) {
      return NextResponse.json({ error: 'user_id or screen_name required' }, { status: 400 });
    }

    const baseUrl = 'https://api.twitter.com/1.1/friendships/create.json';
    const query = user_id ? `user_id=${encodeURIComponent(user_id)}` : `screen_name=${encodeURIComponent(screen_name)}`;
    const fullUrl = `${baseUrl}?${query}&follow=true`;

    const auth = oauthHeader('POST', baseUrl, user_id ? { user_id, follow: 'true' } : { screen_name, follow: 'true' });

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { Authorization: auth },
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json({ success: true, user: { id: data.id_str, screen_name: data.screen_name, following: data.following } });
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'follow_failed' }, { status: 500 });
  }
}
