import Stripe from 'stripe';
import { getSupabaseServer } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    const supabase = getSupabaseServer();

    // Get subscription record
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (!sub?.stripe_subscription_id) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel at period end (user keeps access until end of billing period)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update DB status
    await supabase.from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Cancel subscription error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
