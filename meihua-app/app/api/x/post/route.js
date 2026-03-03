// /app/api/x/post/route.js
// Usage: POST /api/x/post  { "text": "tweet content" }
// Auth: Bearer X_MARKETING_SECRET header

import { NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyAuth(request) {
  const auth = request.headers.get('Authorization');
  return auth === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

// OAuth 1.0a signature generation for X API v2
function generateOAuthHeader(method, url) {
  const oauthParams = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  const signingKey = `${encodeURIComponent(process.env.X_API_SECRET)}&${encodeURIComponent(process.env.X_ACCESS_TOKEN_SECRET)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const header = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return header;
}

export async function POST(request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }
    if (text.length > 280) {
      return NextResponse.json({ error: 'text exceeds 280 chars' }, { status: 400 });
    }

    const url = 'https://api.twitter.com/2/tweets';
    const authHeader = generateOAuthHeader('POST', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, tweet: data.data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
