import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

// GET: Check subscription status by stripe_session_id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stripe_session_id = searchParams.get('session_id');
    if (!stripe_session_id) {
      return Response.json({ active: false });
    }

    // Check Supabase first
    const { data } = await getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('stripe_session_id', stripe_session_id)
      .single();

    if (data) {
      const active = data.status === 'active' && new Date(data.expires_at) > new Date();
      return Response.json({ active, subscription: data });
    }

    // Fallback: verify with Stripe directly
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(stripe_session_id);
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const active = ['active', 'trialing'].includes(sub.status);
        const expires_at = new Date(sub.current_period_end * 1000).toISOString();

        // Save to Supabase for future lookups
        await getSupabase().from('subscriptions').upsert({
          stripe_session_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: active ? 'active' : 'cancelled',
          plan: 'subscription',
          expires_at,
        }, { onConflict: 'stripe_session_id' });

        return Response.json({ active, expires_at });
      }
    }

    return Response.json({ active: false });
  } catch (err) {
    console.error('subscription GET error:', err?.message || err);
    return Response.json({ active: false }, { status: 500 });
  }
}

// POST: Record a new subscription after checkout
export async function POST(request) {
  try {
    const { stripe_session_id } = await request.json();
    if (!stripe_session_id || !process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Missing data' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id);

    if (!session.subscription) {
      // Day pass - just mark as active for 24h
      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await getSupabase().from('subscriptions').upsert({
        stripe_session_id,
        stripe_customer_id: session.customer,
        status: 'active',
        plan: 'daypass',
        expires_at,
      }, { onConflict: 'stripe_session_id' });
      return Response.json({ ok: true, active: true, expires_at });
    }

    const sub = await stripe.subscriptions.retrieve(session.subscription);
    const active = ['active', 'trialing'].includes(sub.status);
    const expires_at = new Date(sub.current_period_end * 1000).toISOString();

    await getSupabase().from('subscriptions').upsert({
      stripe_session_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: active ? 'active' : 'cancelled',
      plan: 'subscription',
      expires_at,
    }, { onConflict: 'stripe_session_id' });

    return Response.json({ ok: true, active, expires_at });
  } catch (err) {
    console.error('subscription POST error:', err?.message || err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
