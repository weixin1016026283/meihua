// /app/api/x/metrics/route.js
// GET /api/x/metrics - returns recent tweets with engagement summary
import { NextResponse } from 'next/server';

function verifyAuth(req) {
  return req.headers.get('Authorization') === `Bearer ${process.env.X_MARKETING_SECRET}`;
}

export async function GET(request) {
  if (!verifyAuth(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const authHeader = { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` };

    let userId = process.env.X_USER_ID || '';
    let userData = null;

    if (!userId) {
      const meRes = await fetch('https://api.twitter.com/2/users/me', { headers: authHeader });
      const me = await meRes.json();
      if (me?.data?.id) {
        userId = me.data.id;
        userData = me.data;
      }
    }

    if (!userId && process.env.X_USERNAME) {
      const byName = await fetch(`https://api.twitter.com/2/users/by/username/${process.env.X_USERNAME}`, { headers: authHeader });
      const named = await byName.json();
      if (named?.data?.id) {
        userId = named.data.id;
        userData = named.data;
      }
    }

    if (!userId) return NextResponse.json({ error: 'x_user_not_resolved: set X_USER_ID or X_USERNAME' }, { status: 500 });

    const url = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
    url.searchParams.set('max_results', '50');
    url.searchParams.set('tweet.fields', 'public_metrics,created_at');
    const res = await fetch(url.toString(), {
      headers: authHeader,
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
      user: userData || { id: userId },
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
