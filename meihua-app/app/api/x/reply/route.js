// /app/api/x/reply/route.js
// POST /api/x/reply  { "text": "reply", "reply_to": "tweet_id" }
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyAuth(req) {
  return req.headers.get('Authorization') === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

function oauthHeader(method, url) {
  const params = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  const paramStr = Object.keys(params).sort()
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
  const base = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(paramStr);
  const key = encodeURIComponent(process.env.X_API_SECRET) + '&' + encodeURIComponent(process.env.X_ACCESS_TOKEN_SECRET);
  params.oauth_signature = crypto.createHmac('sha1', key).update(base).digest('base64');
  return 'OAuth ' + Object.keys(params).sort()
    .map(k => encodeURIComponent(k) + '="' + encodeURIComponent(params[k]) + '"').join(', ');
}

export async function POST(request) {
  if (!verifyAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { text, reply_to } = await request.json();
    if (!text || !reply_to) return NextResponse.json({ error: 'text and reply_to required' }, { status: 400 });
    const url = 'https://api.twitter.com/2/tweets';
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: oauthHeader('POST', url), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, reply: { in_reply_to_tweet_id: reply_to } }),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json({ success: true, tweet: data.data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
