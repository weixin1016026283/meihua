// /app/api/x/metrics/route.js
// GET /api/x/metrics - returns recent tweets with engagement summary
import { NextResponse } from 'next/server';

function verifyAuth(req) {
  return req.headers.get('Authorization') === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

export async function GET(request) {
  if (!verifyAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
    });
    const me = await meRes.json();

    const url = new URL(`https://api.twitter.com/2/users/${me.data.id}/tweets`);
    url.searchParams.set('max_results', '50');
    url.searchParams.set('tweet.fields', 'public_metrics,created_at');
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
    });
    const data = await res.json();

    let impressions = 0, engagements = 0;
    if (data.data) {
      data.data.forEach(t => {
        const m = t.public_metrics;
        impressions += m.impression_count || 0;
        engagements += (m.like_count + m.reply_count + m.retweet_count + m.quote_count) || 0;
      });
    }

    return NextResponse.json({
      user: me.data,
      tweets: data.data || [],
      summary: {
        total_tweets: (data.data || []).length,
        total_impressions: impressions,
        total_engagements: engagements,
        engagement_rate: impressions > 0 ? ((engagements / impressions) * 100).toFixed(2) + '%' : '0%',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
