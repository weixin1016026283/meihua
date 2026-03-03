import { TwitterApi } from 'twitter-api-v2';

function getClient() {
  const appKey = process.env.X_API_KEY;
  const appSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error('x_oauth_not_configured');
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

function isAuthorized(body) {
  const required = process.env.X_STATS_SECRET || process.env.X_POST_SECRET;
  if (!required) return false;
  return body?.secret && body.secret === required;
}

function parseIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean);
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!isAuthorized(body)) {
      return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const ids = parseIds(body?.tweetIds || body?.ids);
    if (!ids.length) {
      return Response.json({ ok: false, error: 'tweet_ids_required' }, { status: 400 });
    }

    const client = getClient();
    const rw = client.readWrite;

    const tweets = await rw.v2.tweets(ids, {
      'tweet.fields': ['created_at', 'public_metrics', 'lang'],
    });

    const rows = (tweets?.data || []).map(t => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      lang: t.lang,
      metrics: {
        impressions: t?.public_metrics?.impression_count ?? null,
        likes: t?.public_metrics?.like_count ?? 0,
        replies: t?.public_metrics?.reply_count ?? 0,
        reposts: t?.public_metrics?.retweet_count ?? 0,
        quotes: t?.public_metrics?.quote_count ?? 0,
        bookmarks: t?.public_metrics?.bookmark_count ?? 0,
      },
    }));

    const totals = rows.reduce(
      (acc, r) => {
        acc.impressions += Number(r.metrics.impressions || 0);
        acc.likes += Number(r.metrics.likes || 0);
        acc.replies += Number(r.metrics.replies || 0);
        acc.reposts += Number(r.metrics.reposts || 0);
        acc.quotes += Number(r.metrics.quotes || 0);
        acc.bookmarks += Number(r.metrics.bookmarks || 0);
        return acc;
      },
      { impressions: 0, likes: 0, replies: 0, reposts: 0, quotes: 0, bookmarks: 0 }
    );

    return Response.json({ ok: true, count: rows.length, totals, tweets: rows });
  } catch (err) {
    return Response.json(
      { ok: false, error: err?.data?.detail || err?.message || 'x_stats_failed' },
      { status: 500 }
    );
  }
}
