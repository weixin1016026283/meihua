import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getDeviceId } from '../../../lib/getDeviceId';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const deviceId = await getDeviceId();
    const body = await request.json();
    let stripeSessionId = body.sessionId;

    // If no sessionId provided, look up by device_id
    if (!stripeSessionId && deviceId !== 'unknown') {
      const { data } = await getSupabase()
        .from('subscriptions')
        .select('stripe_session_id')
        .eq('device_id', deviceId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      stripeSessionId = data?.stripe_session_id;
    }

    if (!stripeSessionId) {
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    const subscriptionId = session.subscription;

    if (!subscriptionId) {
      return Response.json({ error: 'No subscription found for this session' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return Response.json({
      ok: true,
      cancelAt: subscription.current_period_end,
    });
  } catch (err) {
    console.error('Cancel subscription error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
