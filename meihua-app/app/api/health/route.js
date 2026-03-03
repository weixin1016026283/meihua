import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const checks = { feedback_table: 'unknown', stripe_subscription_price: 'unknown' };
  const alerts = [];

  try {
    const supabase = getSupabase();
    if (!supabase) {
      checks.feedback_table = 'missing_supabase_config';
      alerts.push('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured');
    } else {
      const { error } = await supabase.from('feedback').select('id', { count: 'exact', head: true }).limit(1);
      if (error) {
        checks.feedback_table = 'error';
        alerts.push(`feedback table check failed: ${error.message}`);
      } else {
        checks.feedback_table = 'ok';
      }
    }
  } catch (e) {
    checks.feedback_table = 'error';
    alerts.push(`feedback table check exception: ${e?.message || e}`);
  }

  if (!process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
    checks.stripe_subscription_price = 'missing';
    alerts.push('STRIPE_SUBSCRIPTION_PRICE_ID not configured');
  } else {
    checks.stripe_subscription_price = 'ok';
  }

  if (!process.env.STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID) {
    alerts.push('STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID not configured (annual will fallback to monthly)');
  }

  const status = alerts.length ? 'degraded' : 'ok';
  return Response.json({ ok: status === 'ok', status, checks, alerts }, { status: status === 'ok' ? 200 : 503 });
}
