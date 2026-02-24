import Stripe from 'stripe';
import { getSupabaseServer } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    const supabase = getSupabaseServer();

    // Cancel Stripe subscription if exists
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (sub?.stripe_subscription_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (e) {
        console.error('Stripe cancel during delete:', e?.message);
      }
    }

    // Delete subscription record
    await supabase.from('subscriptions').delete().eq('user_id', userId);

    // Delete user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Delete user error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Delete account error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
