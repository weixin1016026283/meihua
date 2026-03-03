import { TwitterApi } from 'twitter-api-v2';

function getClient() {
  const appKey = process.env.X_API_KEY;
  const appSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error('x_oauth_not_configured');
  }

  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });
}

function isAuthorized(body) {
  const required = process.env.X_POST_SECRET;
  if (!required) return false;
  return body?.secret && body.secret === required;
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!isAuthorized(body)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return Response.json({ ok: false, error: 'text_required' }, { status: 400 });
    }
    if (text.length > 280) {
      return Response.json({ ok: false, error: 'text_too_long' }, { status: 400 });
    }

    const client = getClient();
    const rw = client.readWrite;

    const tweet = await rw.v2.tweet(text);

    return Response.json({ ok: true, id: tweet?.data?.id, text: tweet?.data?.text || text });
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.data?.detail || err?.message || 'x_post_failed' },
      { status: 500 }
    );
  }
}
