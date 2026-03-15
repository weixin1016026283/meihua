import { createClient } from '@supabase/supabase-js';
import { getDeviceId } from '../../../lib/getDeviceId';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const FREE_LIMIT = 3;

export async function GET(request) {
  try {
    const deviceId = await getDeviceId();
    if (deviceId === 'unknown') {
      return Response.json({ remaining: FREE_LIMIT, unlocked: false });
    }

    const supabase = getSupabase();

    // Check for active subscription by device_id
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, expires_at')
      .eq('device_id', deviceId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (sub) {
      return Response.json({ remaining: 999, unlocked: true, expires_at: sub.expires_at });
    }

    // Count AI usage this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', deviceId)
      .gte('created_at', monthStart);

    const remaining = Math.max(0, FREE_LIMIT - (count || 0));
    return Response.json({ remaining, unlocked: false });
  } catch (err) {
    console.error('quota GET error:', err?.message || err);
    return Response.json({ remaining: FREE_LIMIT, unlocked: false }, { status: 500 });
  }
}
