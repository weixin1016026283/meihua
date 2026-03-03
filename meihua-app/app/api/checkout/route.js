import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}


function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

async function trackCheckoutOpen(request, billing, returnTo) {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
    await supabase.from('funnel_events').insert({
      event: 'checkout_open',
      session_id: null,
      page: returnTo === '/' ? '/' : '/mingpan',
      source: null,
      lang: null,
      ip,
      meta: { billing: billing || 'monthly', by: 'checkout_api' },
    });
  } catch {}
}

export async function POST(request) {
  try {
    const { returnTo, billing } = await request.json();

    const origin = request.headers.get('origin') || 'https://meihua-app.vercel.app';
    const returnPath = returnTo === '/' ? '/' : '/mingpan';

    await trackCheckoutOpen(request, billing, returnTo);

    const priceId = billing === 'annual'
      ? (process.env.STRIPE_SUBSCRIPTION_ANNUAL_PRICE_ID || process.env.STRIPE_SUBSCRIPTION_PRICE_ID)
      : process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Payment not configured' }, { status: 500 });
    }
    if (!priceId) {
      return Response.json({ error: 'Subscription price not configured' }, { status: 500 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${returnPath}?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
