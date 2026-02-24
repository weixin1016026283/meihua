import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request) {
  try {
    const { mode } = await request.json();
    const stripe = getStripe();

    const origin = request.headers.get('origin') || 'https://your-domain.vercel.app';

    // mode: 'subscription' ($4.99/mo) or 'daypass' ($1.99 one-time)
    const priceId = mode === 'daypass'
      ? process.env.STRIPE_DAYPASS_PRICE_ID
      : process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!priceId) {
      return Response.json({ error: 'Price not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'daypass' ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/mingpan?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/mingpan`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err?.message || err);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
